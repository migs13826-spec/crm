// Brevo API Client - Abstraction layer for Brevo v3 API
// See: https://developers.brevo.com/reference

export class BrevoApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Brevo API Error (${status}): ${JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

export interface ContactListParams {
  limit?: number;
  offset?: number;
  sort?: "asc" | "desc";
  modifiedSince?: string;
}

export interface CreateContactData {
  email: string;
  attributes?: Record<string, unknown>;
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface UpdateContactData {
  attributes?: Record<string, unknown>;
  listIds?: number[];
  unlinkListIds?: number[];
}

export interface CreateListData {
  name: string;
  folderId: number;
}

export interface CampaignListParams {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sort?: "asc" | "desc";
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  sender: { name: string; email: string };
  htmlContent: string;
  recipients: {
    listIds?: number[];
    segmentIds?: number[];
    exclusionListIds?: number[];
  };
  replyTo?: string;
  toField?: string;
  previewText?: string;
  scheduledAt?: string;
}

export interface UpdateCampaignData {
  name?: string;
  subject?: string;
  sender?: { name: string; email: string };
  htmlContent?: string;
  recipients?: {
    listIds?: number[];
    segmentIds?: number[];
    exclusionListIds?: number[];
  };
  replyTo?: string;
  previewText?: string;
  scheduledAt?: string;
}

export interface CreateTemplateData {
  sender: { name: string; email: string };
  templateName: string;
  htmlContent: string;
  subject: string;
}

export interface UpdateTemplateData {
  sender?: { name: string; email: string };
  templateName?: string;
  htmlContent?: string;
  subject?: string;
}

export interface CreateSenderData {
  name: string;
  email: string;
}

export interface ImportContactsData {
  fileBody?: string;
  fileUrl?: string;
  listIds?: number[];
  notifyUrl?: string;
  newList?: { listName: string; folderId: number };
  updateExistingContacts?: boolean;
  emptyContactsAttributes?: boolean;
}

export class BrevoClient {
  private apiKey: string;
  private baseUrl = "https://api.brevo.com/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      throw new BrevoApiError(response.status, errorBody);
    }

    // Some endpoints return 204 with no body
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  // Account
  async getAccount() {
    return this.request("GET", "/account");
  }

  // Contacts
  async getContacts(params: ContactListParams = {}) {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));
    if (params.sort) query.set("sort", params.sort);
    if (params.modifiedSince)
      query.set("modifiedSince", params.modifiedSince);
    const qs = query.toString();
    return this.request("GET", `/contacts${qs ? `?${qs}` : ""}`);
  }

  async getContact(identifier: string) {
    return this.request("GET", `/contacts/${encodeURIComponent(identifier)}`);
  }

  async createContact(data: CreateContactData) {
    return this.request("POST", "/contacts", data);
  }

  async updateContact(identifier: string, data: UpdateContactData) {
    return this.request(
      "PUT",
      `/contacts/${encodeURIComponent(identifier)}`,
      data
    );
  }

  async deleteContact(identifier: string) {
    return this.request(
      "DELETE",
      `/contacts/${encodeURIComponent(identifier)}`
    );
  }

  async importContacts(data: ImportContactsData) {
    return this.request("POST", "/contacts/import", data);
  }

  // Contact Stats
  async getContactCampaignStats(identifier: string) {
    return this.request(
      "GET",
      `/contacts/${encodeURIComponent(identifier)}/campaignStats`
    );
  }

  // Lists
  async getLists(limit = 50, offset = 0) {
    return this.request(
      "GET",
      `/contacts/lists?limit=${limit}&offset=${offset}`
    );
  }

  async createList(data: CreateListData) {
    return this.request("POST", "/contacts/lists", data);
  }

  async updateList(listId: number, data: { name: string }) {
    return this.request("PUT", `/contacts/lists/${listId}`, data);
  }

  async deleteList(listId: number) {
    return this.request("DELETE", `/contacts/lists/${listId}`);
  }

  async addContactsToList(listId: number, emails: string[]) {
    return this.request("POST", `/contacts/lists/${listId}/contacts/add`, {
      emails,
    });
  }

  async removeContactsFromList(listId: number, emails: string[]) {
    return this.request(
      "POST",
      `/contacts/lists/${listId}/contacts/remove`,
      { emails }
    );
  }

  // Contact Attributes
  async getAttributes() {
    return this.request("GET", "/contacts/attributes");
  }

  // Campaigns
  async getCampaigns(params: CampaignListParams = {}) {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.status) query.set("status", params.status);
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));
    if (params.sort) query.set("sort", params.sort);
    const qs = query.toString();
    return this.request("GET", `/emailCampaigns${qs ? `?${qs}` : ""}`);
  }

  async getCampaign(campaignId: number) {
    return this.request("GET", `/emailCampaigns/${campaignId}`);
  }

  async createCampaign(data: CreateCampaignData) {
    return this.request("POST", "/emailCampaigns", data);
  }

  async updateCampaign(campaignId: number, data: UpdateCampaignData) {
    return this.request("PUT", `/emailCampaigns/${campaignId}`, data);
  }

  async deleteCampaign(campaignId: number) {
    return this.request("DELETE", `/emailCampaigns/${campaignId}`);
  }

  async sendCampaignNow(campaignId: number) {
    return this.request("POST", `/emailCampaigns/${campaignId}/sendNow`);
  }

  async scheduleCampaign(campaignId: number, scheduledAt: string) {
    return this.request("POST", `/emailCampaigns/${campaignId}/schedule`, {
      scheduledAt,
    });
  }

  async sendTestEmail(campaignId: number, emailTo: string[]) {
    return this.request("POST", `/emailCampaigns/${campaignId}/sendTest`, {
      emailTo,
    });
  }

  async getCampaignStats(campaignId: number) {
    return this.request(
      "GET",
      `/emailCampaigns/${campaignId}/statistics`
    );
  }

  async getCampaignLinkStats(campaignId: number) {
    return this.request(
      "GET",
      `/emailCampaigns/${campaignId}/statistics/links`
    );
  }

  // Templates
  async getTemplates(limit = 50, offset = 0) {
    return this.request(
      "GET",
      `/smtp/templates?limit=${limit}&offset=${offset}`
    );
  }

  async createTemplate(data: CreateTemplateData) {
    return this.request("POST", "/smtp/templates", data);
  }

  async updateTemplate(templateId: number, data: UpdateTemplateData) {
    return this.request("PUT", `/smtp/templates/${templateId}`, data);
  }

  async deleteTemplate(templateId: number) {
    return this.request("DELETE", `/smtp/templates/${templateId}`);
  }

  // Senders
  async getSenders() {
    return this.request("GET", "/senders");
  }

  async createSender(data: CreateSenderData) {
    return this.request("POST", "/senders", data);
  }

  async deleteSender(senderId: number) {
    return this.request("DELETE", `/senders/${senderId}`);
  }

  // SMTP Statistics
  async getSmtpStats(params?: { days?: number }) {
    const query = new URLSearchParams();
    if (params?.days) query.set("days", String(params.days));
    const qs = query.toString();
    return this.request(
      "GET",
      `/smtp/statistics/aggregatedReport${qs ? `?${qs}` : ""}`
    );
  }

  // Transactional Email (for test sends)
  async sendTransactionalEmail(data: {
    sender: { name: string; email: string };
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
  }) {
    return this.request("POST", "/smtp/email", data);
  }
}

// Factory to get a BrevoClient for an organization
export function createBrevoClient(apiKey: string): BrevoClient {
  return new BrevoClient(apiKey);
}
