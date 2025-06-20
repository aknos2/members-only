import { format } from 'date-fns';

export function formatMessageDates(messages) {
  return messages.map(msg => ({
    ...msg,
    created_at: format(new Date(msg.created_at), 'MMM dd yyyy HH:mm:ss')
  }));
}