import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { MailPlus } from "lucide-react";
import { type TicketStatus } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TicketsTable from "./TicketsTable";
import TicketsFilters from "./TicketsFilters";

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
}

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [open, setOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const bookMutation = useMutation({
    mutationFn: (payload: {
      senderName: string;
      senderEmail: string;
      subject: string;
      body: string;
    }) => axios.post("/api/tickets/book-email", payload).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-stats"] });
      setOpen(false);
      setSenderName("");
      setSenderEmail("");
      setSubject("");
      setBody("");
      setErrorMsg(null);
      if (data?.ticket?.id) {
        navigate(`/tickets/${data.ticket.id}`);
      }
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.response?.data?.error || "Failed to book ticket. Please check your inputs."
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    bookMutation.mutate({ senderName, senderEmail, subject, body });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <MailPlus className="mr-2 h-4 w-4" />
              Book Ticket via Email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Ticket via Email (AI Auto-Reply)</DialogTitle>
              <DialogDescription>
                Create a support ticket for a customer email. AI will automatically classify it, generate a reply, and email the customer via SendGrid.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="book-name">Customer Name</Label>
                <Input
                  id="book-name"
                  placeholder="Rushikesh Sable"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-email">Customer Email</Label>
                <Input
                  id="book-email"
                  type="email"
                  placeholder="rushikeshsable9714@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-subject">Subject</Label>
                <Input
                  id="book-subject"
                  placeholder="Course access or payment issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="book-body">Message</Label>
                <Textarea
                  id="book-body"
                  rows={4}
                  placeholder="Describe the issue..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={bookMutation.isPending}>
                  {bookMutation.isPending ? "Booking & Sending AI Email..." : "Book Ticket & Send AI Reply"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <TicketsFilters filters={filters} onChange={setFilters} />
      <TicketsTable filters={filters} />
    </div>
  );
}
