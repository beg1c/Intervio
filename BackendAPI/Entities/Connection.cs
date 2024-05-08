using System.Net.WebSockets;

namespace API.Entities
{
    public class Connection
    {
        public Connection(User user, Room room)
        {
            users = new List<User> { user };
            this.room = room;
        }

        public List<User>? users { get; set; }
        public Room? room { get; set; }
    }
}