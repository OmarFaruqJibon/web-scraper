import { useState } from "react";

const DemoSection = ({ data, fetchData }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  // Download CSV
  const downloadCSV = (rows, filename) => {
    setDownloading(true);
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Location",
      "Image",
      "Description",
    ];
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        [
          `"${(row.name || "").replace(/"/g, '""')}"`,
          `"${(row.email || []).join("; ").replace(/"/g, '""')}"`,
          `"${(row.phone || []).join("; ").replace(/"/g, '""')}"`,
          `"${(row.location || "").replace(/"/g, '""')}"`,
          `"${(row.image || "").replace(/"/g, '""')}"`,
          `"${(row.description || "").replace(/"/g, '""')}"`,
        ].join(",")
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

  // Download PDF (simple text version)
  const downloadPDF = (content, filename) => {
    setDownloading(true);
    const pdfContent = `PDF Export\n\n${content}`;
    const blob = new Blob([pdfContent], { type: "application/pdf" });
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

  // Filter search
  const filteredData = data.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If no data
  if (!data || data.length === 0) {
    return (
      <section id="demo" className="py-16 px-6 relative mb-52">
        <div className="absolute -top-20 left-0 w-full h-20 bg-gradient-to-b from-transparent to-gray-900"></div>
        <h2 className="font-bold text-3xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
          Scraping Results Dashboard
        </h2>
        <div className="text-gray-400 text-center py-12 bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/50">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
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

  const validRows =
    selectedItem?.information?.data?.filter(
      (item) => item.name && item.name.trim() !== ""
    ) || [];

  const hasTableData = validRows.length > 0;
  const hasRawData = selectedItem?.information?.raw;

  return (
    <section id="demo" className="py-16 px-6 relative mb-52 h-[700px]">
      <div className="absolute -top-20 left-0 w-full h-20 bg-gradient-to-b from-transparent to-gray-900"></div>

      {/* Toggle button for mobile */}
      <div className="lg:hidden mb-4 flex justify-between">
        <h3 className="text-lg font-bold text-white">Scraping Results</h3>
        <button
          onClick={() => {
            if (!showSidebar) {
              // Reset selection when opening sidebar
              setSelectedItem(null);
            }
            setShowSidebar(!showSidebar);
          }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg"
        >
          {showSidebar ? "Hide Websites" : "Show Websites"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sidebar */}
        <div
          className={`w-full lg:w-1/3 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/50 p-3 flex flex-col h-full flex-shrink-0
            ${showSidebar ? "block" : "hidden"} lg:flex`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Scraped Websites
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Scrollable website list */}
          <div className="overflow-y-auto flex-1 pr-2">
            {filteredData.length > 0 ? (
              <div className="space-y-2">
                {filteredData.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedItem(item);
                      setShowSidebar(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedItem === item
                        ? "bg-gradient-to-r from-cyan-700/30 to-emerald-700/30 border border-cyan-500/30"
                        : "bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-3 h-3 rounded-full mt-1.5 mr-3 ${
                          selectedItem === item ? "bg-cyan-400" : "bg-gray-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-left">
                          {item.title || "Untitled Website"}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 text-left break-all">
                          {item.url}
                        </p>
                        <div className="text-left mt-2 text-xs text-gray-500">
                          <span>
                            {item.information?.data?.filter(
                              (i) => i.name && i.name.trim() !== ""
                            ).length || 0}{" "}
                            Contacts
                          </span>
                        </div>
                      </div>
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

        {/* Right side - Table / Raw */}
        <div className="w-full lg:w-2/3 bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/50 p-3 flex flex-col h-full">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white">
                      {selectedItem.title.replace(/\s{2,}/g, " ") ||
                        "Untitled Website"}
                    </h3>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline text-sm break-all"
                    >
                      {selectedItem.url.replace(/\s{2,}/g, " ")}
                    </a>
                  </div>

                  <div className="flex space-x-2">
                    {hasTableData && (
                      <button
                        onClick={() =>
                          downloadCSV(
                            validRows,
                            `${
                              selectedItem.title.replace(/\s{2,}/g, " ") ||
                              "data"
                            }.csv`
                          )
                        }
                        disabled={downloading}
                        className="px-4 py-2 bg-white text-black cursor-pointer text-sm rounded-lg shadow transition-all duration-300 flex items-center"
                      >
                        {downloading ? "Downloading..." : "CSV"}
                      </button>
                    )}
                    {hasRawData && !hasTableData && (
                      <button
                        onClick={() =>
                          downloadPDF(
                            selectedItem.information.raw,
                            `${
                              selectedItem.title.trim().replace(/\s{2,}/g, " ") ||
                              "data"
                            }.pdf`
                          )
                        }
                        disabled={downloading}
                        className="px-4 py-2 bg-white text-black cursor-pointer text-sm rounded-lg shadow transition-all duration-300 flex items-center"
                      >
                        {downloading ? "Downloading..." : "PDF"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table / Raw Data */}
              {hasTableData ? (
                <div className="overflow-auto flex-1">
                  <div className="max-h-full overflow-auto w-full border border-gray-700 rounded-lg">
                    <table className="min-w-full text-xs sm:text-sm border-collapse">
                      <thead className="bg-gray-900 text-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 border border-gray-700">
                            Name
                          </th>
                          <th className="px-4 py-3 border border-gray-700">
                            Email
                          </th>
                          <th className="px-4 py-3 border border-gray-700">
                            Phone
                          </th>
                          <th className="px-4 py-3 border border-gray-700">
                            Location
                          </th>
                          <th className="px-4 py-3 border border-gray-700">
                            Image
                          </th>
                          <th className="px-4 py-3 border border-gray-700">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {validRows.map((item, i) => (
                          <tr
                            key={i}
                            className="odd:bg-gray-900 even:bg-gray-800/50 hover:bg-gray-700/70 transition-colors"
                          >
                            <td className="px-4 py-3 border border-gray-700">
                              {item.name}
                            </td>
                            <td className="px-4 py-3 border border-gray-700">
                              {item.email?.length > 0
                                ? item.email.map((em, idx) => (
                                    <p key={idx}>
                                      <a
                                        href={`mailto:${em}`}
                                        className="text-white hover:underline transition-colors"
                                      >
                                        {em}
                                      </a>
                                    </p>
                                  ))
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 border border-gray-700">
                              {item.phone?.length > 0
                                ? item.phone.map((ph, idx) => (
                                    <p key={idx}>
                                      <a
                                        href={`tel:${ph}`}
                                        className="text-white hover:underline transition-colors"
                                      >
                                        {ph}
                                      </a>
                                    </p>
                                  ))
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 border border-gray-700">
                              {item.location || "N/A"}
                            </td>
                            <td className="px-4 py-3 border border-gray-700">
                              {item.image ? (
                                <a
                                  href={item.image}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name || "profile"}
                                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                                  />
                                </a>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-4 py-3 border border-gray-700 max-w-xs truncate">
                              {item.description || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : hasRawData ? (
                <div className="overflow-auto flex-1">
                  <pre className="text-xs sm:text-sm text-left p-4 bg-gray-800/50 border border-gray-700 rounded-lg h-full overflow-auto whitespace-pre-wrap">
                    {selectedItem.information.raw}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <p>No structured or raw data available for this website.</p>
                </div>
              )}
            </>
          ) : !showSidebar ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <p className="text-lg mb-2">Select a website to view data</p>
              <p className="text-sm">
                Choose from the list on the left to display extracted information
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
