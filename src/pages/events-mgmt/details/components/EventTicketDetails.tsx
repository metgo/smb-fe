import { ImageWithFallback } from "@/components/shared";
import { formatDate } from "@/helpers/formatter";
import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import {
  Edit,
  Copy,
  Trash2,
  Ticket,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Tag,
  TrendingDown,
  Package,
} from "lucide-react";

interface TicketData {
  _id: string;
  name: string;
  description: string;
  images: { image?: string }[];
  price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
  };
  quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
    perUserLimit: number;
  };
  status: string;
  type: string;
  dayDescription: {
    date: string;
    startTime: string;
    endTime: string;
    _id: string;
  }[];
}

interface EventTicketDetailsProps {
  tickets: TicketData[];
}

const EventTicketDetails: React.FC<EventTicketDetailsProps> = ({ tickets }) => {
  const { language } = useAppSelector((state) => state.settings);
  const { isDark } = useThemeClasses();

  const calculateTotalRevenue = (ticket: TicketData) => {
    return ticket.quantity.sold * ticket.price.sellingPrice;
  };

  const calculateDiscountAmount = (ticket: TicketData) => {
    return ticket.price.markedPrice - ticket.price.sellingPrice;
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      PAID: isDark
        ? "bg-blue-500/20 text-blue-400 border-blue-800/50"
        : "bg-blue-100 text-blue-700 border-blue-200",
      VIP: isDark
        ? "bg-purple-500/20 text-purple-400 border-purple-800/50"
        : "bg-purple-100 text-purple-700 border-purple-200",
      FREE: isDark
        ? "bg-green-500/20 text-green-400 border-green-800/50"
        : "bg-green-100 text-green-700 border-green-200",
      EARLY_BIRD: isDark
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-800/50"
        : "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
      typeColors[type] ||
      (isDark
        ? "bg-gray-700 text-gray-300 border-gray-600"
        : "bg-gray-100 text-gray-700 border-gray-200")
    );
  };

  if (!tickets?.length) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center py-12 rounded-xl border",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200",
        )}
      >
        <Ticket
          className={clsx(
            "w-12 h-12 mb-3",
            isDark ? "text-gray-600" : "text-gray-400",
          )}
        />
        <h3
          className={clsx(
            "text-base font-semibold mb-1",
            isDark ? "text-gray-300" : "text-gray-700",
          )}
        >
          No Tickets Available
        </h3>
        <p
          className={clsx(
            "text-sm",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          No tickets have been created for this event yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary Stats */}
      <div>
        <h2
          className={clsx(
            "text-2xl font-bold",
            isDark ? "text-white" : "text-gray-900",
          )}
        >
          Event Tickets
        </h2>
        <p
          className={clsx(
            "text-sm mt-1",
            isDark ? "text-gray-400" : "text-gray-600",
          )}
        >
          {tickets.length}{" "}
          {tickets.length === 1 ? "ticket type" : "ticket types"} available
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div
          className={clsx(
            "rounded-xl border p-4",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Package
              className={clsx(
                "w-5 h-5",
                isDark ? "text-blue-400" : "text-blue-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium uppercase tracking-wide",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Total Available
            </span>
          </div>
          <p
            className={clsx(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {tickets.reduce(
              (sum, t) =>
                sum + (t.quantity.isUnlimited ? 0 : t.quantity.initial),
              0,
            )}
          </p>
        </div>

        {/* Sold Tickets */}
        <div
          className={clsx(
            "rounded-xl border p-4",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Tag
              className={clsx(
                "w-5 h-5",
                isDark ? "text-green-400" : "text-green-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium uppercase tracking-wide",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Sold
            </span>
          </div>
          <p
            className={clsx(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {tickets.reduce((sum, t) => sum + t.quantity.sold, 0)}
          </p>
        </div>

        {/* Remaining Tickets */}
        <div
          className={clsx(
            "rounded-xl border p-4",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Ticket
              className={clsx(
                "w-5 h-5",
                isDark ? "text-purple-400" : "text-purple-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium uppercase tracking-wide",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Remaining
            </span>
          </div>
          <p
            className={clsx(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            {tickets.reduce(
              (sum, t) =>
                sum + (t.quantity.isUnlimited ? 0 : t.quantity.remaining),
              0,
            )}
          </p>
        </div>

        {/* Total Revenue */}
        <div
          className={clsx(
            "rounded-xl border p-4",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign
              className={clsx(
                "w-5 h-5",
                isDark ? "text-yellow-400" : "text-yellow-600",
              )}
            />
            <span
              className={clsx(
                "text-xs font-medium uppercase tracking-wide",
                isDark ? "text-gray-400" : "text-gray-600",
              )}
            >
              Revenue
            </span>
          </div>
          <p
            className={clsx(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900",
            )}
          >
            ₪
            {tickets
              .reduce((sum, t) => sum + calculateTotalRevenue(t), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const image = ticket.images?.[0]?.image;
          const isFree =
            ticket.price?.sellingPrice === 0 ||
            ticket.type?.toLowerCase() === "free";
          const hasDiscount =
            ticket.price.markedPrice > ticket.price.sellingPrice;
          const soldPercentage = ticket.quantity.isUnlimited
            ? 0
            : (ticket.quantity.sold / ticket.quantity.initial) * 100;

          return (
            <div
              key={ticket._id}
              className={clsx(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300",
              )}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="relative lg:w-80 h-64 lg:h-auto overflow-hidden group">
                  <ImageWithFallback
                    src={image}
                    alt={ticket.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Action Icons */}
                  <div
                    className={clsx(
                      "absolute top-3 right-3 flex gap-2 rounded-lg p-1.5 backdrop-blur-sm",
                      isDark ? "bg-gray-900/80" : "bg-white/90",
                    )}
                  >
                    <button
                      title="Edit"
                      className={clsx(
                        "p-1.5 rounded-md transition-colors",
                        isDark
                          ? "hover:bg-blue-500/20 hover:text-blue-400"
                          : "hover:bg-blue-50 hover:text-blue-600",
                      )}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      title="Copy"
                      className={clsx(
                        "p-1.5 rounded-md transition-colors",
                        isDark
                          ? "hover:bg-green-500/20 hover:text-green-400"
                          : "hover:bg-green-50 hover:text-green-600",
                      )}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      title="Delete"
                      className={clsx(
                        "p-1.5 rounded-md transition-colors",
                        isDark
                          ? "hover:bg-red-500/20 hover:text-red-400"
                          : "hover:bg-red-50 hover:text-red-600",
                      )}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Free Badge */}
                  {isFree && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg">
                        FREE
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm capitalize",
                        ticket.status === "active"
                          ? "bg-green-500/90 text-white"
                          : "bg-gray-500/90 text-white",
                      )}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={clsx(
                          "text-xl font-bold mb-2",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {ticket.name}
                      </h3>
                      <p
                        className={clsx(
                          "text-sm leading-relaxed line-clamp-2",
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        {ticket.description}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <span
                      className={clsx(
                        "px-3 py-1.5 rounded-lg text-sm font-semibold border whitespace-nowrap",
                        getTypeColor(ticket.type),
                      )}
                    >
                      {ticket.type}
                    </span>
                  </div>

                  {/* Price Section */}

                  {/* Quantity Section */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div
                      className={clsx(
                        "rounded-lg p-4",
                        isDark ? "bg-gray-900/50" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DollarSign
                            className={clsx(
                              "w-5 h-5",
                              isDark ? "text-gray-400" : "text-gray-500",
                            )}
                          />
                          <div>
                            <p
                              className={clsx(
                                "text-xs font-medium uppercase tracking-wide mb-1",
                                isDark ? "text-gray-400" : "text-gray-600",
                              )}
                            >
                              Price
                            </p>
                            <div className="flex items-center gap-2">
                              {hasDiscount && !isFree && (
                                <span
                                  className={clsx(
                                    "line-through text-sm",
                                    isDark ? "text-gray-500" : "text-gray-400",
                                  )}
                                >
                                  ₪{ticket.price.markedPrice}
                                </span>
                              )}
                              <span
                                className={clsx(
                                  "font-bold text-2xl",
                                  isFree
                                    ? "text-green-500"
                                    : isDark
                                      ? "text-white"
                                      : "text-gray-900",
                                )}
                              >
                                {isFree
                                  ? "FREE"
                                  : `₪${ticket.price.sellingPrice}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Discount Badge */}
                        {hasDiscount && !isFree && (
                          <div
                            className={clsx(
                              "px-3 py-1.5 rounded-lg flex items-center gap-1.5",
                              isDark
                                ? "bg-red-500/20 text-red-400"
                                : "bg-red-100 text-red-700",
                            )}
                          >
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-semibold">
                              ₪{calculateDiscountAmount(ticket)} off
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Initial */}
                    <div
                      className={clsx(
                        "rounded-lg p-3",
                        isDark ? "bg-gray-900/50" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Package
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <span
                          className={clsx(
                            "text-xs font-medium uppercase tracking-wide",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Total
                        </span>
                      </div>
                      <p
                        className={clsx(
                          "text-lg font-bold",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {ticket.quantity.isUnlimited
                          ? "∞"
                          : ticket.quantity.initial}
                      </p>
                    </div>

                    {/* Sold */}
                    <div
                      className={clsx(
                        "rounded-lg p-3",
                        isDark ? "bg-gray-900/50" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Tag
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <span
                          className={clsx(
                            "text-xs font-medium uppercase tracking-wide",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Sold
                        </span>
                      </div>
                      <p
                        className={clsx(
                          "text-lg font-bold",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {ticket.quantity.sold}
                      </p>
                    </div>

                    {/* Remaining */}
                    <div
                      className={clsx(
                        "rounded-lg p-3",
                        isDark ? "bg-gray-900/50" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Ticket
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <span
                          className={clsx(
                            "text-xs font-medium uppercase tracking-wide",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Remaining
                        </span>
                      </div>
                      <p
                        className={clsx(
                          "text-lg font-bold",
                          isDark ? "text-white" : "text-gray-900",
                        )}
                      >
                        {ticket.quantity.isUnlimited
                          ? "∞"
                          : ticket.quantity.remaining}
                      </p>
                    </div>
                  </div>

                  {/* Sales Progress */}
                  {!ticket.quantity.isUnlimited && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={clsx(
                            "text-xs font-medium",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Sales Progress
                        </span>
                        <span
                          className={clsx(
                            "text-xs font-semibold",
                            isDark ? "text-gray-300" : "text-gray-700",
                          )}
                        >
                          {soldPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className={clsx(
                          "h-2 rounded-full overflow-hidden",
                          isDark ? "bg-gray-700" : "bg-gray-200",
                        )}
                      >
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-300",
                            soldPercentage > 80
                              ? "bg-red-500"
                              : soldPercentage > 50
                                ? "bg-yellow-500"
                                : "bg-green-500",
                          )}
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Per User Limit */}
                    <div className="flex items-center gap-1.5">
                      <Users
                        className={clsx(
                          "w-4 h-4",
                          isDark ? "text-gray-400" : "text-gray-500",
                        )}
                      />
                      <span
                        className={clsx(
                          isDark ? "text-gray-400" : "text-gray-600",
                        )}
                      >
                        Max {ticket.quantity.perUserLimit} per user
                      </span>
                    </div>

                    {/* Revenue */}
                    {ticket.quantity.sold > 0 && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <span
                          className={clsx(
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Revenue: ₪
                          {calculateTotalRevenue(ticket).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Dates */}
                  {ticket.dayDescription?.length > 0 && (
                    <div
                      className={clsx(
                        "rounded-lg p-4 border-t",
                        isDark
                          ? "border-gray-700 bg-gray-900/30"
                          : "border-gray-200 bg-gray-50/50",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar
                          className={clsx(
                            "w-4 h-4",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        />
                        <h4
                          className={clsx(
                            "text-xs font-semibold uppercase tracking-wide",
                            isDark ? "text-gray-400" : "text-gray-600",
                          )}
                        >
                          Valid for {ticket.dayDescription.length}{" "}
                          {ticket.dayDescription.length === 1
                            ? "date"
                            : "dates"}
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {ticket.dayDescription.map((day) => (
                          <div
                            key={day._id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Clock
                              className={clsx(
                                "w-3.5 h-3.5",
                                isDark ? "text-gray-500" : "text-gray-400",
                              )}
                            />
                            <span
                              className={clsx(
                                "font-medium",
                                isDark ? "text-gray-300" : "text-gray-700",
                              )}
                            >
                              {formatDate(day.date, language)}
                            </span>
                            <span
                              className={clsx(
                                isDark ? "text-gray-500" : "text-gray-400",
                              )}
                            >
                              •
                            </span>
                            <span
                              className={clsx(
                                isDark ? "text-gray-400" : "text-gray-600",
                              )}
                            >
                              {day.startTime} – {day.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTicketDetails;
