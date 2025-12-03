import { useState, useEffect, useRef } from "react";

const DemoSection = ({ data, fetchData }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showList, setShowList] = useState(true);
  console.log(data);

  // refs for custom scrollbar syncing
  const tableWrapperRef = useRef(null); // scroll container that holds the table
  const tableRef = useRef(null); // the <table> element
  const scrollbarTrackRef = useRef(null); // visible track under the table
  const thumbRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const thumbStartLeftRef = useRef(0);

  // CSV Export (handles social array-of-objects)
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

  // auto-select first non-empty category
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

  // ---------- Custom scrollbar logic ----------
  // Update thumb size & position according to table scroll state
  const updateScrollbar = () => {
    const wrapper = tableWrapperRef.current;
    const track = scrollbarTrackRef.current;
    const thumb = thumbRef.current;
    if (!wrapper || !track || !thumb) return;

    const contentWidth = wrapper.scrollWidth || 1;
    const containerWidth = wrapper.clientWidth || 1;
    const trackWidth = track.clientWidth || 1;
    const scrollLeft = wrapper.scrollLeft || 0;

    if (contentWidth <= containerWidth) {
      // no overflow: show full-width thumb
      thumb.style.width = `${trackWidth}px`;
      thumb.style.transform = `translateX(0px)`;
      return;
    }

    // compute thumb width proportionally (min width enforced)
    const rawThumbWidth = (containerWidth / contentWidth) * trackWidth;
    const thumbWidth = Math.max(rawThumbWidth, 30); // minimum 30px
    const maxThumbLeft = trackWidth - thumbWidth;
    const maxScrollLeft = contentWidth - containerWidth;
    const thumbLeft = (scrollLeft / maxScrollLeft) * maxThumbLeft;

    thumb.style.width = `${Math.min(thumbWidth, trackWidth)}px`;
    thumb.style.transform = `translateX(${thumbLeft}px)`;
  };

  // click on track => jump scroll
  const onTrackClick = (e) => {
    const wrapper = tableWrapperRef.current;
    const track = scrollbarTrackRef.current;
    const thumb = thumbRef.current;
    if (!wrapper || !track || !thumb) return;

    // ignore if clicking the thumb directly
    if (e.target === thumb) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thumbWidth = thumb.getBoundingClientRect().width;
    const trackWidth = track.clientWidth;
    const desiredThumbLeft = clickX - thumbWidth / 2;
    const maxThumbLeft = trackWidth - thumbWidth;
    const clampedThumbLeft = Math.max(
      0,
      Math.min(desiredThumbLeft, maxThumbLeft)
    );
    const ratio = clampedThumbLeft / (maxThumbLeft || 1);
    const newScrollLeft = ratio * (wrapper.scrollWidth - wrapper.clientWidth);
    wrapper.scrollLeft = newScrollLeft;
    updateScrollbar();
  };

  // thumb drag handlers
  useEffect(() => {
    const wrapper = tableWrapperRef.current;
    const track = scrollbarTrackRef.current;
    const thumb = thumbRef.current;
    if (!wrapper || !track || !thumb) return;

    let onMouseMove, onMouseUp, onTouchMove, onTouchEnd;

    const onThumbMouseDown = (e) => {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      // compute current thumb left from transform
      const transform = thumb.style.transform || "";
      const match = transform.match(/translateX\(([-\d.]+)px\)/);
      thumbStartLeftRef.current = match ? parseFloat(match[1]) : 0;

      // attach document listeners
      onMouseMove = (ev) => {
        if (!isDraggingRef.current) return;
        const dx = ev.clientX - dragStartXRef.current;
        const trackWidth = track.clientWidth;
        const thumbWidth = thumb.getBoundingClientRect().width;
        const maxThumbLeft = trackWidth - thumbWidth;
        let newLeft = thumbStartLeftRef.current + dx;
        newLeft = Math.max(0, Math.min(newLeft, maxThumbLeft));
        const ratio = newLeft / (maxThumbLeft || 1);
        wrapper.scrollLeft =
          ratio * (wrapper.scrollWidth - wrapper.clientWidth);
        updateScrollbar();
      };

      onMouseUp = () => {
        isDraggingRef.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const onThumbTouchStart = (e) => {
      isDraggingRef.current = true;
      dragStartXRef.current = e.touches[0].clientX;
      const transform = thumb.style.transform || "";
      const match = transform.match(/translateX\(([-\d.]+)px\)/);
      thumbStartLeftRef.current = match ? parseFloat(match[1]) : 0;

      onTouchMove = (ev) => {
        if (!isDraggingRef.current) return;
        const dx = ev.touches[0].clientX - dragStartXRef.current;
        const trackWidth = track.clientWidth;
        const thumbWidth = thumb.getBoundingClientRect().width;
        const maxThumbLeft = trackWidth - thumbWidth;
        let newLeft = thumbStartLeftRef.current + dx;
        newLeft = Math.max(0, Math.min(newLeft, maxThumbLeft));
        const ratio = newLeft / (maxThumbLeft || 1);
        wrapper.scrollLeft =
          ratio * (wrapper.scrollWidth - wrapper.clientWidth);
        updateScrollbar();
      };

      onTouchEnd = () => {
        isDraggingRef.current = false;
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };

      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    };

    // attach listeners
    thumb.addEventListener("mousedown", onThumbMouseDown);
    thumb.addEventListener("touchstart", onThumbTouchStart, { passive: true });
    track.addEventListener("click", onTrackClick);

    // keep synced when table scrolls
    const onWrapperScroll = () => updateScrollbar();
    wrapper.addEventListener("scroll", onWrapperScroll);

    // cleanup
    return () => {
      thumb.removeEventListener("mousedown", onThumbMouseDown);
      thumb.removeEventListener("touchstart", onThumbTouchStart);
      track.removeEventListener("click", onTrackClick);
      wrapper.removeEventListener("scroll", onWrapperScroll);
      if (onMouseMove) document.removeEventListener("mousemove", onMouseMove);
      if (onMouseUp) document.removeEventListener("mouseup", onMouseUp);
      if (onTouchMove) document.removeEventListener("touchmove", onTouchMove);
      if (onTouchEnd) document.removeEventListener("touchend", onTouchEnd);
    };
  }, [selectedItem, activeCategory, data]);

  // recalc scrollbar on resize & when table content changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      // schedule via rAF to ensure DOM updated
      requestAnimationFrame(updateScrollbar);
    });

    if (tableWrapperRef.current)
      resizeObserver.observe(tableWrapperRef.current);
    if (tableRef.current) resizeObserver.observe(tableRef.current);

    window.addEventListener("resize", updateScrollbar);

    // initial calc (slight delay to wait for layout)
    const t = setTimeout(updateScrollbar, 50);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updateScrollbar);
      resizeObserver.disconnect();
    };
  }, [selectedItem, activeCategory, data]);

  // ensure content exists
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

  // ------------ Render --------------
  return (
    <section id="demo" className="py-16 px-6 relative mb-52">
      <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
        {/* Left side: Website List */}
        <div
          className={`w-full lg:w-1/3 ${
            showList ? "block" : "hidden"
          } lg:block min-h-0`}
        >
          <div className="bg-gray-900/60 rounded-2xl shadow-lg border border-gray-700/50 p-3 flex flex-col h-full min-h-0">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Scraped Websites
              </h3>
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

            <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2 min-h-0">
              {filteredData.length > 0 ? (
                <div className="space-y-2">
                  {filteredData.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowList(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedItem === item
                          ? "bg-gradient-to-r from-cyan-700/30 to-emerald-700/30 border border-cyan-500/30"
                          : "bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30"
                      }`}
                    >
                      <h4 className="font-medium text-white truncate">
                        {item.title || "Untitled Website"}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {item.url}
                      </p>
                      <div className="text-xs text-gray-500 mt-2">
                        {Object.entries(item.information || {})
                          .filter(
                            ([, arr]) => Array.isArray(arr) && arr.length > 0
                          )
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

        {/* Right side: Website Details */}
        <div
          className={`w-full lg:w-2/3 ${
            showList ? "hidden" : "block"
          } lg:block min-h-0`}
        >
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

                <div className="items-center mb-4">
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-white">
                      {selectedItem.title || "Untitled Website"}
                    </h3>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 break-words text-center text-sm"
                    >
                      {selectedItem.url}
                    </a>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(selectedItem.information || {})
                    .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
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

                {/* Table area */}
                {activeCategory ? (
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadCSV(
                            selectedItem.information[activeCategory],
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
                        disabled={downloading}
                        className="px-4 py-2 bg-white text-black text-sm rounded-lg shadow"
                      >
                        {downloading ? "Downloading..." : "CSV"}
                      </button>
                    </div>

                    {/* Wrap table in a horizontal scroll container */}
                    <div className="w-full overflow-x-scroll scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 flex-1 border border-gray-700 rounded-lg">
                      <div className="min-w-max">
                        <table className="w-full text-xs sm:text-sm border-collapse">
                          <thead className="bg-gray-900 text-gray-200 sticky top-0 z-10">
                            <tr>
                              {(
                                tableHeaders[activeCategory] ||
                                Object.keys(
                                  selectedItem.information[
                                    activeCategory
                                  ]?.[0] || {}
                                )
                              ).map((col) => (
                                <th
                                  key={col}
                                  className="px-4 py-3 border border-gray-700 capitalize text-left"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="overflow-y-auto">
                            {selectedItem.information[activeCategory].map(
                              (row, i) => (
                                <tr
                                  key={i}
                                  className="odd:bg-gray-900 even:bg-gray-800/50 hover:bg-gray-700/70"
                                >
                                  {(
                                    tableHeaders[activeCategory] ||
                                    Object.keys(
                                      selectedItem.information[
                                        activeCategory
                                      ]?.[0] || {}
                                    )
                                  ).map((col) => (
                                    <td
                                      key={col}
                                      className="px-4 py-3 border border-gray-700"
                                    >
                                      {col.toLowerCase() === "image" &&
                                      row[col] ? (
                                        <img
                                          src={row[col]}
                                          alt="Image"
                                          className="w-16 h-16 object-cover rounded"
                                        />
                                      ) : Array.isArray(row[col]) ? (
                                        row[col].map((val, idx) =>
                                          typeof val === "object" &&
                                          val !== null ? (
                                            <div key={idx}>
                                              {val.platform
                                                ? `${val.platform}: `
                                                : ""}
                                              <a
                                                href={val.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 underline"
                                              >
                                                {val.link}
                                              </a>
                                            </div>
                                          ) : (
                                            val
                                          )
                                        )
                                      ) : typeof row[col] === "object" &&
                                        row[col] !== null ? (
                                        JSON.stringify(row[col])
                                      ) : (
                                        row[col] || "N/A"
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
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
