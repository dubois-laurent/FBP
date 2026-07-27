using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using FBP.Api.Models;

namespace FBP.Api.Data.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly IDbConnectionFactory _factory;

        public MessageRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task<(IEnumerable<Message> Messages, int Total)> GetConversationAsync(
            Guid userId1, Guid userId2, int page, int limit)
        {
            var offset = (page - 1) * limit;
            const string where =
                "WHERE (m.sender_id = @UserId1 AND m.receiver_id = @UserId2) " +
                "   OR (m.sender_id = @UserId2 AND m.receiver_id = @UserId1)";

            var countSql = $"SELECT COUNT(*) FROM messages m {where}";
            var dataSql =
                "SELECT m.id AS Id, m.sender_id AS SenderId, m.receiver_id AS ReceiverId, " +
                "       m.content AS Content, m.sent_at AS SentAt, " +
                "       s.name AS SenderName, r.name AS ReceiverName " +
                "FROM messages m " +
                "JOIN users s ON m.sender_id = s.id " +
                "JOIN users r ON m.receiver_id = r.id " +
                $"{where} " +
                "ORDER BY m.sent_at ASC LIMIT @Limit OFFSET @Offset";

            var param = new { UserId1 = userId1, UserId2 = userId2, Limit = limit, Offset = offset };

            using (var conn = _factory.Create())
            {
                conn.Open();
                var total = await conn.ExecuteScalarAsync<int>(countSql, param);
                var messages = await conn.QueryAsync<Message>(dataSql, param);
                return (messages, total);
            }
        }

        public async Task<Message> CreateAsync(Guid senderId, Guid receiverId, string content)
        {
            var id = Guid.NewGuid();
            using (var conn = _factory.Create())
            {
                conn.Open();
                await conn.ExecuteAsync(
                    "INSERT INTO messages (id, sender_id, receiver_id, content, sent_at) " +
                    "VALUES (@Id, @SenderId, @ReceiverId, @Content, now())",
                    new { Id = id, SenderId = senderId, ReceiverId = receiverId, Content = content });

                return await conn.QueryFirstOrDefaultAsync<Message>(
                    "SELECT m.id AS Id, m.sender_id AS SenderId, m.receiver_id AS ReceiverId, " +
                    "       m.content AS Content, m.sent_at AS SentAt, " +
                    "       s.name AS SenderName, r.name AS ReceiverName " +
                    "FROM messages m " +
                    "JOIN users s ON m.sender_id = s.id " +
                    "JOIN users r ON m.receiver_id = r.id " +
                    "WHERE m.id = @Id",
                    new { Id = id });
            }
        }
    }
}
