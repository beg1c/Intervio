using API.Entities;
using API.Models;
using System.Text;
using System.Text.Json;

namespace API.Services
{
    public class CodeExecutionService
    {
        private readonly HttpClient _httpClient;

        public CodeExecutionService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ExecuteResponse?> ExecuteCode(ExecuteRequest executeMessage, User? user = null)
        {   
            StringContent jsonContent = new(JsonSerializer.Serialize(executeMessage), Encoding.UTF8, "application/json");

            try
            {
                ExecuteResponse response = await _httpClient.PostAsync("submissions", jsonContent).Result.Content.ReadFromJsonAsync<ExecuteResponse>();
                response.user = user;
                return response;
            }
            catch
            {
                return null;
            }

        }
    }
}
