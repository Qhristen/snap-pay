import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
  Req,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PaystackService } from "./paystack.service";
import { Public } from "../../common/decorators/public.decorator";

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: Record<string, unknown>;
    transfer_code?: string;
    recipient?: {
      recipient_code: string;
    };
  };
}

@ApiTags("Webhooks")
@Controller("webhooks")
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly paystackService: PaystackService,
    @InjectQueue("webhooks") private readonly webhookQueue: Queue,
  ) { }

  @Public()
  @Post("paystack")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Paystack webhook",
    description:
      "Handles Paystack webhook events (charge.success, transfer.success, transfer.failed, transfer.reversed). Signature is verified using HMAC-SHA512 and then pushed to a queue for processing.",
  })
  @ApiHeader({
    name: "x-paystack-signature",
    description: "HMAC-SHA512 signature from Paystack",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Webhook received and queued",
    schema: { example: { received: true } },
  })
  @ApiResponse({ status: 401, description: "Invalid webhook signature" })
  async handlePaystackWebhook(
    @Body() body: PaystackWebhookEvent,
    @Headers("x-paystack-signature") signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // 1. Verify webhook signature before sending to queue
    // We MUST use req.rawBody to accurately verify the HMAC signature.
    // If the body is completely empty, default to an empty string to prevent crypto crashes.
    const rawBody = req.rawBody ? req.rawBody.toString() : (body ? JSON.stringify(body) : "");

    if (!this.paystackService.verifyWebhookSignature(rawBody, signature)) {
      this.logger.warn("Invalid Paystack webhook signature");
      throw new UnauthorizedException("Invalid signature");
    }

    const { event } = body;
    this.logger.log(`Received and queuing Paystack webhook: ${event}`);

    // 2. Push to queue for background processing
    await this.webhookQueue.add(`paystack-${event}`, body, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
    });

    return { received: true };
  }
}
