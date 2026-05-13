import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";

@Processor("mail-processing")
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor() {
    super();
  }

  async process(job: Job<{ email: string; type: string; data?: any }>) {
    const { email, type, data } = job.data;
    this.logger.log({ event: "sending_email", email, type });

    try {
      // SIMULATION: Call Email Provider (Nodemailer, SendGrid, etc.)
      // await this.mailService.send(email, type, data);

      this.logger.log({ event: "email_sent_successfully", email, type });
    } catch (error) {
      this.logger.error({
        event: "email_sending_failed",
        email,
        type,
        error: error.message,
      });
      throw error;
    }
  }
}
