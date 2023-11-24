using System.ComponentModel.DataAnnotations;
using System.Net.WebSockets;

namespace API.Entities
{
    public class Room
    {
        public Room(string name, string question = "Write a program in C++ to find Size of fundamental data types.\r\nSample Output:\r\nFind Size of fundamental data types :\r\n------------------------------------------\r\nThe sizeof(char) is : 1 bytes\r\nThe sizeof(short) is : 2 bytes\r\nThe sizeof(int) is : 4 bytes\r\nThe sizeof(long) is : 8 bytes\r\nThe sizeof(long long) is : 8 bytes\r\nThe sizeof(float) is : 4 bytes\r\nThe sizeof(double) is : 8 bytes\r\nThe sizeof(long double) is : 16 bytes\r\nThe sizeof(bool) is : 1 bytes", string editor = "print('Hello World!')", int language_id = 71)
        {
            this.name = name;
            this.question = question;
            this.editor = editor;
            this.language_id = language_id;
        }

        [Key]
        public string name { get; set; }
        public string question { get; set; }
        public string editor { get; set; }
        public int language_id { get; set; }
    }
}
