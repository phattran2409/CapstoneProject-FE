import { z } from "zod";

export const roomSchema = z.object({
    roomName: z.string().min(1, 'createRoom.validation.nameRequired').max(50, 'createRoom.validation.nameTooLong'),
    description: z.string().max(100, 'createRoom.validation.descriptionTooLong').optional(),
}); 

export type RoomFormData = z.infer<typeof roomSchema>;