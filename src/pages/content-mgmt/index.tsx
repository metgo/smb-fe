import { toast } from "sonner";
import { useState, } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { mockBusinesses } from "@/helpers/mockBusinesses";
import {
  X,
  Send,
  ChevronDown,
  ListCollapse,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { MessageComposerModal } from "./components/MessageComposerModal";
import { SendResultsModal } from "./components/SendResultsModal";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

import { ContentComposer, Contents } from "./components";

interface SendResult {
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  emailStatus: "success" | "failed";
  smsStatus: "success" | "failed";
  errorMessage?: string;
}


type SidebarState = "collapsed" | "expanded" | "both";


export default function ContentMgmtPage() {
  const { isDark } = useThemeClasses();
  const { t } = useTranslation("businesses");

  const intitialTemplateContent = [
    {
      title: t("featured_businesses"),
      subTitle: "",
      description: "",
      contents: [],
    },
    {
      title: t("homepage_hero_section"),
      subTitle: "",
      description: "",
      contents: [],
    },
    {
      title: t("recommended_this_week"),
      subTitle: "",
      description: "",
      contents: [],
    },
  ]

  const [templateContents, setTemplateContent] = useState<IContentTemplate[]>(intitialTemplateContent)

  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<Set<string>>(
    new Set(),
  );
  const toggleState = () => {
    if (sidebarState === "collapsed") setSidebarState("both");
    else if (sidebarState === "both") setSidebarState("expanded");
    else setSidebarState("collapsed");
  };


  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showSendResults, setShowSendResults] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);


  const handleSendMessage = () => {
    const selected = mockBusinesses.filter((b) => selectedBacklogIds.has(b.id));
    const results: SendResult[] = selected.map((business) => {
      const emailSuccess = Math.random() > 0.1;
      const smsSuccess = Math.random() > 0.15;
      return {
        customerId: business.id,
        customerName: `Customer of ${business.name}`,
        email: `customer@${business.name
          .toLowerCase()
          .replace(/\s+/g, "")}.com`,
        phone: `+972-5${Math.floor(Math.random() * 10)}-${Math.floor(
          1000000 + Math.random() * 9000000,
        )}`,
        emailStatus: emailSuccess ? "success" : "failed",
        smsStatus: smsSuccess ? "success" : "failed",
        errorMessage:
          !emailSuccess || !smsSuccess ? "Network timeout" : undefined,
      };
    });

    setSendResults(results);
    setShowMessageComposer(false);
    setShowSendResults(true);
    setSelectedBacklogIds(new Set());

    toast.success(t("messages_sent_to_customers", { count: results?.length }));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`min-h-screen  dark:bg-gray-950 transition-colors flex flex-col  ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col">
            {/* Fixed Header Section */}
            <div
              className={`
              shrink-0 
              border-b p-6
              ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}
            `}
            >
              <h1
                className={`text-2xl font-bold mb-2 ${isDark ? "text-gray-400" : "text-gray-900"}`}
              >
                {t("content_manager_title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("content_manager_description")}
              </p>

              {selectedBacklogIds.size > 0 && (
                <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-teal-900 dark:text-teal-100">
                      {selectedBacklogIds.size} business
                      {selectedBacklogIds.size !== 1 ? "es" : ""} selected
                    </p>
                    <div className="flex items-center gap-2">
                      <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        Actions
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBacklogIds(new Set())}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleState}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-200 transition-colors duration-200 focus:outline-none mt-4 ml-4"
              aria-label="Toggle sidebar"
            >
              {sidebarState === "collapsed" && (
                <ChevronsLeft className="w-6 h-6 text-gray-700" />
              )}
              {sidebarState === "expanded" && (
                <ChevronsRight className="w-6 h-6 text-gray-700" />
              )}
              {sidebarState === "both" && (
                <ListCollapse className="w-6 h-6 text-gray-700" />
              )}
            </button>

            {/* Scrollable Content */}
            <div className="flex h-full px-4">
              {(sidebarState === "collapsed" || sidebarState === "both") && (
                <Contents />
              )}

              {(sidebarState === "expanded" || sidebarState === "both") && (
                <ContentComposer
                  templateContents={templateContents}
                  setTemplateContent={setTemplateContent}
                />
              )}
            </div>
          </main>
        </div>

        <MessageComposerModal
          isOpen={showMessageComposer}
          onClose={() => setShowMessageComposer(false)}
          recipientCount={selectedBacklogIds.size}
          onSend={handleSendMessage}
        />

        <SendResultsModal
          isOpen={showSendResults}
          onClose={() => setShowSendResults(false)}
          results={sendResults}
        />
      </div>
    </DndProvider>
  );
}
