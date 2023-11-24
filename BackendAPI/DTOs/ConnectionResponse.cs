using API.Entities;

namespace API.DTOs
{
    public class ConnectionResponse
    {
        public ConnectionResponse(List<string>? users, Room? room, string? status)
        {
            this.users = users;
            this.room = room;
            this.status = status;
        }

        public List<string>? users { get; set; }
        public Room? room { get; set; }
        public string? status { get; set; }
    }
}
