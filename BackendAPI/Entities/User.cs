using System.Net.WebSockets;

namespace API.Entities
{
    public class User
    {
        public User(string userName, WebSocket webSocket)
        {
            this.userName = userName;
            this.webSocket = webSocket;
        }
        public string userName { get; set; }
        public WebSocket webSocket { get; set; }
    }
}
