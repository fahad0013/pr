import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
  message?: string;
}

export function LoginPromptModal({ open, onOpenChange, onLogin, message }: LoginPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] text-center">
        <DialogTitle className="sr-only">লগইন প্রয়োজন</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">লগইন প্রয়োজন</h2>
          <p className="text-sm text-muted-foreground">
            {message || "এই ফিচারটি ব্যবহার করতে প্রথমে লগইন করুন।"}
          </p>
          <Button className="w-full min-h-[48px] text-base font-medium" onClick={onLogin}>
            <LogIn className="mr-2 h-5 w-5" />
            লগইন করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
