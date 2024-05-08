namespace API.Models
{
    public class ExecuteRequest
    {
        public string? source_code {  get; set; }
        public int language_id { get; set; }
        public string wait { get; set; }
        public string? stdin { get; set; }
    }
}
