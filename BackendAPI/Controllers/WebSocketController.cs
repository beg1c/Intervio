using API.DTOs;
using API.Entities;
using API.Models;
using API.Services;
using API.WebSockets;
using Azure;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace API.Controllers
{
    public class WebSocketController : ControllerBase
    {
        private ConnectionManagerService _connectionManager;
        private CodeExecutionService _codeExecutionService;

        public WebSocketController(ConnectionManagerService connectionManager, CodeExecutionService codeExecutionService)
        {
            _connectionManager = connectionManager;
            _codeExecutionService = codeExecutionService;
        }

        [Route("/ws")]
        public async Task Get()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await Echo(webSocket);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }

        private async Task Echo(WebSocket webSocket)
        {
            var buffer = new byte[1024 * 8];
            var receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);

            while (!receiveResult.CloseStatus.HasValue)
            {
                WebSocketMessage webSocketMessage = new WebSocketMessage();

                string encodedResult = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
                try
                {
                    webSocketMessage = JsonSerializer.Deserialize<WebSocketMessage>(encodedResult)!;
                } 
                catch (Exception) 
                {
                    await SendErrorMessage(webSocket, "Could not parse data.");
                }

                switch (webSocketMessage.type)
                {
                    case "offer":
                    case "answer":
                    case "ice-candidate":
                        await ForwardMessagesToClients(webSocket, buffer, receiveResult);
                        break;
                    case "create":
                        try
                        {
                            await HandleCreateRoomMessage(webSocket, webSocketMessage.data.ToString());
                        }
                        catch
                        {
                            await SendErrorMessage(webSocket, "Could not parse create request.");
                        }
                        break;
                    case "join":
                        try
                        {
                            JoinRequest joinRequest = JsonSerializer.Deserialize<JoinRequest>(webSocketMessage.data);
                            await HandleJoinRoomMessage(webSocket, joinRequest);
                        }
                        catch
                        {
                            await SendErrorMessage(webSocket, "Could not parse join request.");
                        }          
                        break;
                    case "run":
                        try
                        {
                            ExecuteRequest executeRequest = JsonSerializer.Deserialize<ExecuteRequest>(webSocketMessage.data);
                            await HandleRunMessage(webSocket, executeRequest);
                        }
                        catch
                        {
                            await SendErrorMessage(webSocket, "Could not parse execute request.");
                        }
                        break;
                    case "room":                        
                        try
                        {
                            Room room = JsonSerializer.Deserialize<Room>(webSocketMessage.data);
                            await HandleRoomMessage(webSocket, room);
                        }
                        catch
                        {
                            await SendErrorMessage(webSocket, "Could not parse room data.");
                        }
                        break;
                    default:
                        await SendErrorMessage(webSocket, "Unknown message type.");
                        break;
                }

                receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            await HandleSocketDisconnect(webSocket);
        }


        private async Task HandleCreateRoomMessage(WebSocket webSocket, string userName)
        {
            if (userName.Length > 20)
            {
                await SendErrorMessage(webSocket, "Username should not be longer than 20 characters.");
            }
            else
            {
                WebSocketMessage message = new WebSocketMessage();
                message.type = "connection";
                message.data = _connectionManager.CreateRoom(userName, webSocket);

                await SendMessage(webSocket, message);
            }
        }

        private async Task HandleJoinRoomMessage(WebSocket webSocket, JoinRequest joinRequest)
        {
            if (joinRequest.userName == null || joinRequest.roomName == null) 
            {
                await SendErrorMessage(webSocket, "Username and room name can not be null.");
            }
            else if (joinRequest.userName.Length > 20)
            {
                await SendErrorMessage(webSocket, "Username should not be longer than 20 characters.");
            }
            else
            {
                WebSocketMessage message = new WebSocketMessage();
                message.type = "connection";

                ConnectionResponse response = _connectionManager.JoinRoom(joinRequest, webSocket);
                message.data = response;

                if (response.users == null)
                {
                        await SendMessage(webSocket, message);
                }
                else
                {
                    foreach (var pair in _connectionManager.GetConnectionMembersBySocket(webSocket))
                    {
                        await SendMessage(pair.webSocket, message);
                    }
                }
            }
        }

        private async Task HandleRunMessage(WebSocket webSocket, ExecuteRequest executeMessage)
        {
            User user = _connectionManager.GetConnectionUserBySocket(webSocket);
            WebSocketMessage message = new WebSocketMessage();
            message.type = "run";
            message.data = _codeExecutionService.ExecuteCode(executeMessage, user).Result;

            if (message.data == null)
            {
                foreach (var pair in _connectionManager.GetConnectionMembersBySocket(webSocket))
                {
                    await SendErrorMessage(pair.webSocket, "Unexpeceted error occured while executing code.");
                }
            }
            else
            {
                foreach (var pair in _connectionManager.GetConnectionMembersBySocket(webSocket))
                {
                    await SendMessage(pair.webSocket, message);
                }
            }
        }


        private async Task HandleRoomMessage(WebSocket webSocket, Room room)
        {
            _connectionManager.SaveState(room);

            foreach (var pair in _connectionManager.GetConnectionMembersBySocket(webSocket))
            {
                if (pair.webSocket.State == WebSocketState.Open && pair.webSocket != webSocket)
                {
                    WebSocketMessage message = new WebSocketMessage();
                    message.type = "room";
                    message.data = room;

                    await SendMessage(pair.webSocket, message);
                }
            }
        }

        private async Task HandleSocketDisconnect(WebSocket webSocket)
        {

            List<User> connectedUsers = _connectionManager.GetConnectionMembersBySocket(webSocket);

            if (connectedUsers != null)
            {
                ConnectionResponse response = _connectionManager.RemoveSocket(webSocket);

                if (response != null)
                {
                    foreach (var pair in connectedUsers)
                    {
                        if (pair.webSocket.State == WebSocketState.Open && pair.webSocket != webSocket)
                        {
                            WebSocketMessage message = new WebSocketMessage();
                            message.type = "connection";
                            message.data = response;

                            await SendMessage(pair.webSocket, message);
                        }
                    }
                }
            }

            await webSocket.CloseAsync(closeStatus: WebSocketCloseStatus.NormalClosure,
                        statusDescription: "Closed by the Connection Manager",
                        cancellationToken: CancellationToken.None);
        }

        private async Task SendErrorMessage(WebSocket webSocket, string error)
        {
            WebSocketMessage message = new WebSocketMessage();
            message.type = "error";
            message.data = error;

            await SendMessage(webSocket, message);
        }

        private async Task SendMessage(WebSocket webSocket, WebSocketMessage message)
        {
            ArraySegment<byte> encodedMessage = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
            await webSocket.SendAsync(encodedMessage,
                        messageType: WebSocketMessageType.Text,
                        endOfMessage: true,
                        CancellationToken.None);
        }

        private async Task ForwardMessagesToClients(WebSocket webSocket, byte[] buffer, WebSocketReceiveResult message)
        {
            foreach (var pair in _connectionManager.GetConnectionMembersBySocket(webSocket))
            {
                if (pair.webSocket.State == WebSocketState.Open && pair.webSocket != webSocket)
                {
                    await pair.webSocket.SendAsync(
                        new ArraySegment<byte>(buffer, 0, message.Count),
                        message.MessageType,
                        message.EndOfMessage,
                        CancellationToken.None);
                }
            }
        }
    }


}
