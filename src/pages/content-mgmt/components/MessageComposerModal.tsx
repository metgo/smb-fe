import React, { useState } from "react";
import {
  X,
  Send,
  Mail,
  MessageSquare,
  TestTube,
  Plus,
  Save,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Badge } from "./ui/badge";

interface MessageComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  onSend: (data: MessageData) => void;
  theme: "light" | "dark";
}

export interface MessageData {
  emailMessage: string;
  smsMessage: string;
  subject: string;
  template: string;
  testEmail?: string;
  testPhone?: string;
  isSplitView: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  emailMessage: string;
  smsMessage: string;
}

const SYSTEM_VARIABLES = [
  { key: "{customer_name}", label: "Customer Name" },
  { key: "{authority_name}", label: "Authority Name" },
  { key: "{dmo_name}", label: "DMO Name" },
  { key: "{campaign_id}", label: "Campaign ID" },
  { key: "{campaign_slogan}", label: "Campaign Slogan" },
];

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Message",
    subject: "Welcome to {dmo_name}",
    emailMessage:
      "Dear {customer_name},\n\nWelcome to {dmo_name}! We are excited to have you explore our region.\n\nBest regards,\n{authority_name}",
    smsMessage:
      "Welcome {customer_name}! Explore {dmo_name} - {campaign_slogan}",
  },
  {
    id: "promotion",
    name: "Promotion Announcement",
    subject: "Special Offer from {dmo_name}",
    emailMessage:
      "Hi {customer_name},\n\nCheck out our latest promotion: {campaign_slogan}\n\nCampaign ID: {campaign_id}\n\nVisit us soon!\n{authority_name}",
    smsMessage:
      "{customer_name}, new offer from {dmo_name}: {campaign_slogan}. Code: {campaign_id}",
  },
  {
    id: "update",
    name: "General Update",
    subject: "Update from {authority_name}",
    emailMessage:
      "Hello {customer_name},\n\nWe have some exciting updates to share with you.\n\nStay tuned!\n{authority_name}",
    smsMessage: "{customer_name}, new updates from {dmo_name}!",
  },
];

export function MessageComposerModal({
  isOpen,
  onClose,
  recipientCount,
  onSend,
  theme,
}: MessageComposerModalProps) {
  const [isSplitView, setIsSplitView] = useState(false);
  const [subject, setSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showTestSend, setShowTestSend] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [templates, setTemplates] =
    useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const isDark = theme === "dark";

  if (!isOpen) return null;

  const insertVariable = (
    variable: string,
    target: "email" | "sms" | "both",
  ) => {
    if (target === "email") {
      setEmailMessage((prev) => prev + variable);
    } else if (target === "sms") {
      setSmsMessage((prev) => prev + variable);
    } else if (target === "both") {
      setEmailMessage((prev) => prev + variable);
      if (isSplitView) {
        setSmsMessage((prev) => prev + variable);
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setEmailMessage(template.emailMessage);
      setSmsMessage(template.smsMessage);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) return;

    const newTemplate: MessageTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      subject,
      emailMessage,
      smsMessage: isSplitView ? smsMessage : emailMessage,
    };

    setTemplates([...templates, newTemplate]);
    setNewTemplateName("");
    setShowSaveTemplate(false);

    // Save to localStorage
    localStorage.setItem(
      "message-templates",
      JSON.stringify([...templates, newTemplate]),
    );
  };

  const handleSend = () => {
    onSend({
      emailMessage,
      smsMessage: isSplitView ? smsMessage : emailMessage,
      subject,
      template: selectedTemplate,
      testEmail: showTestSend ? testEmail : undefined,
      testPhone: showTestSend ? testPhone : undefined,
      isSplitView,
    });
  };

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-2xl ${
          isDark
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
            >
              Send Message to Customers
            </h2>
            <p
              className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Compose and send messages to {recipientCount} selected customer
              {recipientCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* Template Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label
                className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                Message Template
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveTemplate(!showSaveTemplate)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
            </div>

            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">-- Select a template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            {/* Save Template Form */}
            {showSaveTemplate && (
              <div
                className={`mt-3 p-4 rounded-lg border ${
                  isDark
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex gap-2">
                  <input
                    placeholder="Template name..."
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveAsTemplate}
                    disabled={!newTemplateName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Test Send Option */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="test-send"
                checked={showTestSend}
                onChange={(e) => setShowTestSend(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="test-send"
                className={`text-sm font-medium cursor-pointer ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                <TestTube className="w-4 h-4 inline mr-1" />
                Send test message first
              </label>
            </div>

            {showTestSend && (
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Test Email
                    </label>
                    <input
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}
                    >
                      Test Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+972-50-123-4567"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="split-view"
                checked={isSplitView}
                onChange={(e) => setIsSplitView(e.target.checked)}
                className="rounded"
              />
              <label
                htmlFor="split-view"
                className={`text-sm font-medium cursor-pointer ${isDark ? "text-gray-200" : "text-gray-700"}`}
              >
                Use different messages for Email and SMS
              </label>
            </div>
          </div>

          {/* System Variables */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-200" : "text-gray-700"}`}
            >
              System Variables
            </label>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_VARIABLES.map((variable) => (
                <Button
                  key={variable.key}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    insertVariable(variable.key, isSplitView ? "email" : "both")
                  }
                >
                  {variable.label}
                </Button>
              ))}
            </div>
            <p
              className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-500"}`}
            >
              Click to insert variables into your message. They will be replaced
              with actual values when sent.
            </p>
          </div>

          {/* Email Subject */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email Subject
            </label>
            <input
              type="text"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Composition */}
          {isSplitView ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Email Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Message
                  </label>
                  <Badge>{emailMessage.length} chars</Badge>
                </div>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Compose your email message..."
                  rows={12}
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {SYSTEM_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertVariable(variable.key, "email")}
                      className="text-xs"
                    >
                      + {variable.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* SMS Message */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    SMS Message
                  </label>
                  <Badge>{smsMessage.length} chars</Badge>
                </div>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Compose your SMS message..."
                  rows={12}
                  className={`w-full px-4 py-3 rounded-lg border resize-none ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {SYSTEM_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertVariable(variable.key, "sms")}
                      className="text-xs"
                    >
                      + {variable.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className={`block text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}
                >
                  Message (Email & SMS)
                </label>
                <Badge>{emailMessage.length} chars</Badge>
              </div>
              <textarea
                value={emailMessage}
                onChange={(e) => {
                  setEmailMessage(e.target.value);
                  setSmsMessage(e.target.value);
                }}
                placeholder="Compose your message..."
                rows={12}
                className={`w-full px-4 py-3 rounded-lg border resize-none ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between p-6 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!emailMessage.trim() || !subject.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {showTestSend
              ? "Send Test Message"
              : `Send to ${recipientCount} Customer${recipientCount !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
