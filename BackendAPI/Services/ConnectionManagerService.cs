using API.Data;
using API.DTOs;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Reflection;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;

namespace API.WebSockets
{
    public class ConnectionManagerService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private List<Connection> _connections = new List<Connection>();

        public ConnectionManagerService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public ConnectionResponse CreateRoom(string userName, WebSocket webSocket)
        {
            string roomName = GenerateKey();

            User user = new User(userName, webSocket);
            Room room = new Room(roomName);
            Connection connection = new Connection(user, room);

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                db.Rooms.Add(room);
                db.SaveChanges();
            }

            _connections.Add(connection);

            List<string> userNames = connection.users.Select(o => o.userName).ToList();

            return new ConnectionResponse(userNames, room, "ok");
        }

        public ConnectionResponse JoinRoom(JoinRequest joinRequest, WebSocket webSocket)
        {
            Room room;

            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetService<DataContext>();

                if (db.Rooms.Any(room => room.name == joinRequest.roomName))
                {
                    room = db.Rooms.FirstOrDefault(room => room.name == joinRequest.roomName);
                }
                else
                {
                    return new ConnectionResponse(null, null, "invalid");
                }
            }

            if (_connections.Any(c => c.room.name == room.name))
            {
                if (_connections.FirstOrDefault(c => c.room.name == room.name).users.Count >= 2)
                {
                    return new ConnectionResponse(null, null, "full");
                }
                else
                {
                    Connection connection = _connections.FirstOrDefault(c => c.room.name == room.name);

                    User user = new User(joinRequest.userName, webSocket);
                    connection.users.Add(user);

                    List<string> userNames = connection.users.Select(o => o.userName).ToList();

                    return new ConnectionResponse(userNames, connection.room, "ok");
                }
            }
            else
            {
                User user = new User(joinRequest.userName, webSocket);
                Connection connection = new Connection(user, room);

                _connections.Add(connection);

                List<string> userNames = connection.users.Select(o => o.userName).ToList();

                return new ConnectionResponse(userNames, connection.room, "ok");
            }
        }


        public ConnectionResponse? RemoveSocket(WebSocket webSocket)
        {
            //Save room from memory to DB when someone closes connection
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                db.Rooms.Update(_connections.FirstOrDefault(c => c.users.Any(u => u.webSocket == webSocket)).room);
                db.SaveChanges();
            }

            if (_connections.FirstOrDefault(c => c.users.Any(u => u.webSocket == webSocket)).users.Count <= 1)
            {
                _connections.Remove(_connections.FirstOrDefault(c => c.users.Any(u => u.webSocket == webSocket)));
                return null;
            }
            else
            {
                Connection connection = _connections.FirstOrDefault(c => c.users.Any(u => u.webSocket == webSocket));
                User user = connection.users.FirstOrDefault(u => u.webSocket == webSocket);
                connection.users.Remove(user);

                List<string> userNames = connection.users.Select(o => o.userName).ToList();

                return new ConnectionResponse(userNames, connection.room, "ok");
            }
        }

        public void SaveState(Room room)
        {
            _connections.FirstOrDefault(c => c.room.name == room.name).room = room;
        }

        public List<User> GetConnectionMembersByRoomName(string roomName)
        {
            return _connections.FirstOrDefault(connection => connection.room.name == roomName).users;
        }

        public List<User>? GetConnectionMembersBySocket(WebSocket webSocket)
        {
            try
            {
                return _connections.FirstOrDefault(connection => connection.users.Any(u => u.webSocket == webSocket)).users;
            }
            catch
            {
                return null;
            }
        }

        public string GetRoomNameBySocket(WebSocket webSocket)
        {
            return _connections.FirstOrDefault(connection => connection.users.Any(u => u.webSocket == webSocket)).room.name;
        }

        public User GetConnectionUserBySocket(WebSocket webSocket)
        {
            return _connections.FirstOrDefault(connection => connection.users.Any(u => u.webSocket == webSocket)).users.FirstOrDefault(u => u.webSocket == webSocket);
        }

        //TODO Delete rooms from DB after some time

        private string GenerateKey()
        {
            Random random = new Random();
            string Alphabet = "abcdefghijklmnopqrstuvwyxz0123456789";

            char[] chars = new char[11];
            for (int i = 0; i < 11; i++)
            {
                if (i == 3 || i == 7)
                {
                    chars[i] = '-';
                }
                else
                {
                    chars[i] = Alphabet[random.Next(Alphabet.Length)];
                }
            }
            return new string(chars);
        }
    }
}