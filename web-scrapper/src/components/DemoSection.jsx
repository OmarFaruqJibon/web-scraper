// web-scrapper/src/components/DemoSection.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  RefreshCw, 
  Search, 
  Database, 
  Globe, 
  ExternalLink,
  ChevronLeft,
  Filter,
  Zap,
  Sparkles,
  Cpu,
  BarChart3,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronsRight
} from "lucide-react";

const DemoSection = ({ data, fetchData }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tableContainerRef = useRef(null);
  console.log(data);

  // CSV Export
  const downloadCSV = (rows = [], headers = [], filename = "data.csv") => {
    setDownloading(true);

    if ((!headers || headers.length === 0) && rows.length > 0) {
      headers = Object.keys(rows[0]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => {
            let value = row[key];
            if (Array.isArray(value)) {
              value = value
                .map((v) =>
                  typeof v === "object" && v !== null
                    ? `${v.platform || ""}: ${v.link || ""}`
                    : v
                )
                .join("; ");
            } else if (typeof value === "object" && value !== null) {
              value = JSON.stringify(value);
            }
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

  // Table headers
  const tableHeaders = {
    people: [
      "name",
      "role",
      "title",
      "email",
      "phone",
      "location",
      "image",
      "description",
      "social",
    ],
    organization: ["name", "description", "address", "contact"],
    products: ["name", "price", "description", "image"],
    events: [
      "name",
      "date",
      "time",
      "location",
      "description",
      "organizer",
      "speakers",
    ],
    services: ["name", "description", "fee", "department", "contact"],
    courses: [
      "name",
      "department",
      "duration",
      "fee",
      "instructor",
      "description",
      "contact",
    ],
  };

  const filteredData = (data || []).filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // auto select first non-empty category
  useEffect(() => {
    if (selectedItem) {
      const categories = Object.entries(selectedItem.information || {}).filter(
        ([, arr]) => Array.isArray(arr) && arr.length > 0
      );
      setActiveCategory(categories.length > 0 ? categories[0][0] : null);
    } else {
      setActiveCategory(null);
    }
  }, [selectedItem]);

  // Handle refresh with animation
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // ensure content exists
  if (!data || data.length === 0) {
    return (
      <section id="demo" className="py-16 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Results Dashboard
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              View and manage all your scraped data in one place
            </p>
          </div>

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-12 border border-gray-700/50 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 mb-6">
                  <Database className="w-10 h-10 text-blue-400" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Data Available
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Start by scraping a website from the homepage to see results here
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={handleRefresh}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-300 font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Scraping
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-12 px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Results Dashboard
              </h2>
            </div>
            
            <motion.button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-300 font-medium flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </motion.button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              className="p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600/20">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Websites</div>
                  <div className="text-2xl font-bold text-white">{data.length}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-600/20">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Data Entries</div>
                  <div className="text-2xl font-bold text-white">
                    {data.reduce((acc, item) => 
                      acc + Object.values(item.information || {}).reduce((sum, arr) => 
                        sum + (Array.isArray(arr) ? arr.length : 0), 0
                      ), 0
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-600/20">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Processing Speed</div>
                  <div className="text-2xl font-bold text-white">Fast</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content with Fixed Height */}
        <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
          {/* Left side: Website List */}
          <motion.div
            className={`w-full lg:w-1/3 ${showList ? 'block' : 'hidden'} lg:block`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative group h-full flex flex-col">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur" />
              
              {/* Content */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Scraped Websites
                  </h3>
                  <p className="text-sm text-gray-400">
                    Select a website to view detailed data
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search websites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>

                {/* Website List with Scroll */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredData.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            onClick={() => {
                              setSelectedItem(item);
                              setShowList(false);
                            }}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                              selectedItem === item
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30'
                                : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                                <Globe className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate mb-1">
                                  {item.title || "Untitled Website"}
                                </h4>
                                <p className="text-xs text-gray-400 truncate mb-2">
                                  {item.url}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(item.information || {})
                                    .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
                                    .map(([key, arr]) => (
                                      <span
                                        key={key}
                                        className="px-2 py-1 text-xs rounded-lg bg-gray-900/50 text-gray-300"
                                      >
                                        {arr.length} {key}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              {selectedItem === item && (
                                <motion.div
                                  className="ml-2"
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <ChevronsRight className="w-4 h-4 text-blue-400" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Website Count */}
                <div className="pt-4 mt-4 border-t border-gray-700/50">
                  <div className="text-sm text-gray-400">
                    Showing {filteredData.length} of {data.length} websites
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side: Website Details */}
          <motion.div
            className={`w-full lg:w-2/3 ${showList ? 'hidden' : 'block'} lg:block`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative group h-full flex flex-col">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur" />
              
              {/* Content */}
              <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 h-full flex flex-col">
                {/* Back Button for Mobile */}
                <div className="lg:hidden mb-4">
                  <motion.button
                    onClick={() => setShowList(true)}
                    className="px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 font-medium flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to List
                  </motion.button>
                </div>

                {/* Website Header */}
                {selectedItem ? (
                  <>
                    <div className="mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-white truncate mb-1">
                            {selectedItem.title || "Untitled Website"}
                          </h3>
                          <a
                            href={selectedItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm flex items-center gap-1 truncate"
                          >
                            <Globe className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{selectedItem.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                        
                        <motion.button
                          onClick={() =>
                            activeCategory &&
                            downloadCSV(
                              selectedItem.information[activeCategory] || [],
                              tableHeaders[activeCategory] ||
                                Object.keys(
                                  selectedItem.information[activeCategory]?.[0] ||
                                    {}
                                ),
                              `${(selectedItem.title || "data").replace(
                                /\s+/g,
                                "_"
                              )}-${activeCategory}.csv`
                            )
                          }
                          disabled={downloading || !activeCategory}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center gap-2 text-sm whitespace-nowrap"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                          {downloading ? 'Exporting...' : 'Export CSV'}
                        </motion.button>
                      </div>

                      {/* Category Tabs */}
                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                          {Object.entries(selectedItem.information || {})
                            .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
                            .map(([key, arr]) => (
                              <motion.button
                                key={key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setActiveCategory(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                                  activeCategory === key
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800/70'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Database className="w-3 h-3" />
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/30">
                                  {arr.length}
                                </span>
                              </motion.button>
                            ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Data Table Container */}
                    {activeCategory && selectedItem.information[activeCategory] ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Table Container with Scroll */}
                        <div 
                          ref={tableContainerRef}
                          className="flex-1 overflow-auto border border-gray-700/50 rounded-xl relative"
                        >
                          <div className="min-w-max">
                            <table className="w-full border-collapse">
                              <thead className="sticky top-0 z-10">
                                <tr>
                                  {(tableHeaders[activeCategory] ||
                                    Object.keys(
                                      selectedItem.information[activeCategory]?.[0] || {}
                                    )).map((col, index) => (
                                    <th
                                      key={col}
                                      className="px-4 py-3 bg-gradient-to-b from-gray-900 to-gray-800 text-left text-xs sm:text-sm font-semibold text-gray-300 border-b border-gray-700/50 whitespace-nowrap"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 flex-shrink-0" />
                                        <span className="truncate">
                                          {col.charAt(0).toUpperCase() + col.slice(1)}
                                        </span>
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {selectedItem.information[activeCategory].map((row, i) => (
                                  <motion.tr
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.1, delay: i * 0.01 }}
                                    className="border-b border-gray-700/30 last:border-b-0 hover:bg-gray-800/30 transition-colors duration-200"
                                  >
                                    {(tableHeaders[activeCategory] ||
                                      Object.keys(
                                        selectedItem.information[activeCategory]?.[0] || {}
                                      )).map((col) => (
                                      <td
                                        key={col}
                                        className="px-4 py-3 text-gray-300 max-w-[200px]"
                                      >
                                        <div className="text-xs sm:text-sm truncate">
                                          {col.toLowerCase() === "image" &&
                                          row[col] ? (
                                            <img
                                              src={row[col]}
                                              alt=""
                                              className="w-10 h-10 rounded object-cover border border-gray-700/50"
                                            />
                                          ) : Array.isArray(row[col]) ? (
                                            <div className="flex flex-wrap gap-1">
                                              {row[col].slice(0, 2).map((val, idx) =>
                                                typeof val === "object" &&
                                                val !== null ? (
                                                  <a
                                                    key={idx}
                                                    href={val.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/20 text-blue-400 text-xs hover:bg-blue-900/30 truncate max-w-[150px]"
                                                    title={val.platform || 'Link'}
                                                  >
                                                    <span className="truncate">{val.platform || 'Link'}</span>
                                                    <ExternalLink className="w-2 h-2 flex-shrink-0" />
                                                  </a>
                                                ) : (
                                                  <span
                                                    key={idx}
                                                    className="px-2 py-0.5 rounded bg-gray-800/50 text-gray-300 text-xs truncate max-w-[150px]"
                                                    title={val}
                                                  >
                                                    {val}
                                                  </span>
                                                )
                                              )}
                                              {row[col].length > 2 && (
                                                <span className="px-2 py-0.5 rounded bg-gray-800/50 text-gray-500 text-xs">
                                                  +{row[col].length - 2} more
                                                </span>
                                              )}
                                            </div>
                                          ) : typeof row[col] === "object" &&
                                            row[col] !== null ? (
                                            <span className="text-xs text-gray-400 truncate block max-w-[200px]">
                                              {JSON.stringify(row[col])}
                                            </span>
                                          ) : row[col] ? (
                                            <span className="truncate block max-w-[200px]" title={row[col]}>
                                              {row[col]}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-500 italic">
                                              N/A
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Table Stats */}
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-400 gap-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>{selectedItem.information[activeCategory].length} rows</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span>{(tableHeaders[activeCategory] || []).length} columns</span>
                            </div>
                          </div>
                          <div className="text-xs">
                            Scroll horizontally to see all data →
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <div className="p-8 rounded-xl bg-gray-800/30 border border-gray-700/50">
                          <Database className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-lg mb-2">Select a category</p>
                          <p className="text-sm">Choose from the tabs above</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <div className="p-8 rounded-xl bg-gray-800/30 border border-gray-700/50">
                      <Cpu className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-lg mb-2">Select a website</p>
                      <p className="text-sm">Choose from the list on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        /* Custom scrollbar for webkit browsers */
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .overflow-auto::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 4px;
        }

        .overflow-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.7), rgba(147, 51, 234, 0.7));
          border-radius: 4px;
        }

        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0.9), rgba(147, 51, 234, 0.9));
        }

        /* For Firefox */
        .overflow-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.7) rgba(75, 85, 99, 0.3);
        }

        /* Hide scrollbar arrows */
        .overflow-auto::-webkit-scrollbar-button {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default DemoSection;