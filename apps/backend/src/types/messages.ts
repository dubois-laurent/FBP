export interface Message {
    message_id: number;
    sender_id: number;
    sender_name: string | null;
    sender_image: string | null;
    content: string;
    sent_at: string;
}