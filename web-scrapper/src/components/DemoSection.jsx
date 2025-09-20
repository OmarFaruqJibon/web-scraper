import { useState, useEffect } from "react";

const DemoSection = ({ data, fetchData }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(true); // mobile toggle

  // CSV Export
  const downloadCSV = (rows = [], headers = [], filename = "data.csv") => {
    setDownloading(true);

    // fallback headers from first row if headers empty
    if ((!headers || headers.length === 0) && rows.length > 0) {
      headers = Object.keys(rows[0]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => {
            let value = row[key];
            if (Array.isArray(value)) value = value.join("; ");
            if (typeof value === "object" && value !== null) value = JSON.stringify(value);
            return `"${(value || "").toString().replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 1000);
  };

  // Define headers per category
  const tableHeaders = {
    people: ["name", "role", "title", "email", "phone", "location", "image", "description"],
    organization: ["name", "description", "address", "contact"],
    products: ["name", "price", "description", "image"],
    events: ["name", "date", "time", "location", "description", "organizer", "speakers"],
    services: ["name", "description", "fee", "department", "contact"],
    courses: ["name", "department", "duration", "fee", "instructor", "description", "contact"],
  };

  // safe filter (data is validated earlier)
  const filteredData = (data || []).filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-select first available category when a website is chosen
  useEffect(() => {
    if (selectedItem) {
      const categories = Object.entries(selectedItem.information || {}).filter(
        ([, arr]) => Array.isArray(arr) && arr.length > 0
      );
      if (categories.length > 0) {
        setActiveCategory(categories[0][0]); // pick first category
      } else {
        setActiveCategory(null);
      }
    } else {
      setActiveCategory(null);
    }
  }, [selectedItem]);

  // Empty state
  if (!data || data.length === 0) {
    return (
      <section id="demo" className="py-16 px-6 relative mb-52">
        <h2 className="font-bold text-3xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
          Scraping Results Dashboard
        </h2>

        <div className="text-gray-400 text-center py-12 bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/50">
          <p>No data found. Try scraping a website from the homepage!</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-lg hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300"
          >
            Refresh Data
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-16 px-6 relative mb-52">
      {/* fixed height container (keeps scrollbars predictable) */}
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* --------- Website List (left) ---------
            On mobile: show/hide controlled by showList
            On lg+: always visible (lg:block)
            IMPORTANT: add min-h-0 to allow children to shrink and enable inner scrolling
        */}
        <div className={`w-full lg:w-1/3 ${showList ? "block" : "hidden"} lg:block min-h-0`}>
          <div className="bg-gray-900/60 rounded-2xl shadow-lg border border-gray-700/50 p-3 flex flex-col h-full min-h-0">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Scraped Websites</h3>
              <button
                onClick={fetchData}
                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              >
                Refresh
              </button>
            </div>

            <input
              type="text"
              placeholder="Search websites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 mb-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />

            {/* <-- Scrollable list area --> */}
            <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2 min-h-0">
              {filteredData.length > 0 ? (
                <div className="space-y-2">
                  {filteredData.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowList(false); // hide list on mobile; lg override will keep visible on desktop
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedItem === item
                          ? "bg-gradient-to-r from-cyan-700/30 to-emerald-700/30 border border-cyan-500/30"
                          : "bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30"
                      }`}
                    >
                      <h4 className="font-medium text-white truncate">{item.title || "Untitled Website"}</h4>
                      <p className="text-xs text-gray-400 truncate">{item.url}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {Object.entries(item.information || {})
                          .filter(([key, arr]) => Array.isArray(arr) && arr.length > 0)
                          .map(([key, arr]) => (
                            <span key={key} className="mr-2">
                              {arr.length} {key}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No websites found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --------- Website Details (right) ---------
            On mobile: visible when showList === false
            On lg+: always visible
            Add min-h-0 to let inner scrollable children work
        */}
        <div className={`w-full lg:w-2/3 ${showList ? "hidden" : "block"} lg:block min-h-0`}>
          <div className="bg-gray-900/60 rounded-2xl shadow-lg border border-gray-700/50 p-3 flex flex-col h-full min-h-0">
            {selectedItem ? (
              <>
              <div className="flex justify-end mb-6">
                <button
                    onClick={() => setShowList(true)}
                    className="lg:hidden px-1 py-1 bg-gray-700 text-gray-200 text-sm rounded w-16"
                  >
                    ← Back
              </button>
              </div>

                {/* Header + mobile Back */}
                <div className="items-center mb-4">
                  
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-white">{selectedItem.title || "Untitled Website"}</h3>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 break-words text-center text-sm"
                    >
                      {selectedItem.url}
                    </a>
                  </div>


                   {/* <button
                    onClick={() => setShowList(true)}
                    className="lg:hidden px-1 py-1 bg-gray-700 text-gray-200 text-sm rounded hover:bg-gray-600"
                  >
                    ← Back
                  </button> */}

                </div>

                {/* Category Tabs (visible once details shown) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(selectedItem.information || {})
                    .filter(([key, arr]) => Array.isArray(arr) && arr.length > 0)
                    .map(([key, arr]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          activeCategory === key
                            ? "bg-cyan-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {key} ({arr.length})
                      </button>
                    ))}
                </div>

                {/* Table area: make it scrollable. flex-1 + min-h-0 allows vertical scrollbar */}
                {activeCategory ? (
                  <div className="flex-1 overflow-auto min-h-0">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadCSV(
                            selectedItem.information[activeCategory],
                            tableHeaders[activeCategory] ||
                              Object.keys(selectedItem.information[activeCategory]?.[0] || {}),
                            `${(selectedItem.title || "data").replace(/\s+/g, "_")}-${activeCategory}.csv`
                          )
                        }
                        disabled={downloading}
                        className="px-4 py-2 bg-white text-black text-sm rounded-lg shadow"
                      >
                        {downloading ? "Downloading..." : "CSV"}
                      </button>
                    </div>

                    <div className="max-w-full overflow-auto">
                      <table className="min-w-full text-xs sm:text-sm border-collapse border border-gray-700">
                        <thead className="bg-gray-900 text-gray-200 sticky top-0 z-10">
                          <tr>
                            {(tableHeaders[activeCategory] ||
                              Object.keys(selectedItem.information[activeCategory]?.[0] || {})).map((col) => (
                              <th key={col} className="px-4 py-3 border border-gray-700 capitalize">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedItem.information[activeCategory].map((row, i) => (
                            <tr key={i} className="odd:bg-gray-900 even:bg-gray-800/50 hover:bg-gray-700/70">
                              {(tableHeaders[activeCategory] ||
                                Object.keys(selectedItem.information[activeCategory]?.[0] || {})).map((col) => (
                                <td key={col} className="px-4 py-3 border border-gray-700">
                                  {Array.isArray(row[col])
                                    ? row[col].join(", ")
                                    : typeof row[col] === "object" && row[col] !== null
                                    ? JSON.stringify(row[col])
                                    : row[col] || "N/A"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 min-h-0">
                    <p>Select a category tab above to view data</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 min-h-0">
                <p className="text-lg mb-2">Select a website to view data</p>
                <p className="text-sm">Choose from the list on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
