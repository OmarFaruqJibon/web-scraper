const DemoSection = ({ data, downloadCSV, downloadPDF }) => {
  console.log(data)
  return (
    <section id="demo" className="py-16 px-6 relative">
      <div className="absolute -top-20 left-0 w-full h-20 bg-gradient-to-b from-transparent to-gray-900"></div>

      <h2 className="font-bold text-3xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
        Live Result
      </h2>

      {data.length === 0 ? (
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
          <p>No data found. Try scraping a website!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {data.map((info, infoIndex) => {
            const validRows =
              info?.information?.data?.filter(
                (item) => item.name && item.name.trim() !== ""
              ) || [];

            return (
              <div
                key={infoIndex}
                className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300 hover:shadow-cyan-500/10"
              >
                {/* URL + Title */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 break-all">
                    <strong className="text-gray-300">🔗 URL :</strong>{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                      href={info.url}
                    >
                      {info.url}
                    </a>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    <strong className="text-gray-300">Title :</strong>{" "}
                    {info.title || "Title not found!"}
                  </p>
                </div>

                {/* Table or PDF */}
                {validRows.length > 0 ? (
                  <div>
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadCSV(validRows, `${info.title}.csv`)
                        }
                        className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm rounded-lg shadow hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        ⬇ Download CSV
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="max-h-[500px] overflow-y-auto w-full border border-gray-700 rounded-lg">
                        <table className="min-w-[1000px] text-xs sm:text-sm border-collapse">
                          <thead className="bg-gray-700 text-gray-200 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 border border-gray-600">Name</th>
                              <th className="px-4 py-3 border border-gray-600">Email</th>
                              <th className="px-4 py-3 border border-gray-600">Phone</th>
                              <th className="px-4 py-3 border border-gray-600">Location</th>
                              <th className="px-4 py-3 border border-gray-600">Image</th>
                              <th className="px-4 py-3 border border-gray-600">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validRows.map((item, i) => (
                              <tr
                                key={i}
                                className="odd:bg-gray-800 even:bg-gray-700/50"
                              >
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.name}
                                </td>
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.email?.length > 0
                                    ? item.email.map((em, idx) => (
                                        <p key={idx}>
                                          <a
                                            href={`mailto:${em}`}
                                            className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                                          >
                                            {em}
                                          </a>
                                        </p>
                                      ))
                                    : "N/A"}
                                </td>
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.phone?.length > 0
                                    ? item.phone.map((ph, idx) => (
                                        <p key={idx}>
                                          <a
                                            href={`tel:${ph}`}
                                            className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
                                          >
                                            {ph}
                                          </a>
                                        </p>
                                      ))
                                    : "N/A"}
                                </td>
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.location || "N/A"}
                                </td>
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.image ? (
                                    <a
                                      href={item.image}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <img
                                        src={item.image}
                                        alt={item.name || "profile"}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-600"
                                      />
                                    </a>
                                  ) : (
                                    "N/A"
                                  )}
                                </td>
                                <td className="px-4 py-3 border border-gray-600">
                                  {item.description || "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : info?.information?.raw ? (
                  <div>
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={() =>
                          downloadPDF(info.information.raw, `${info.title}.pdf`)
                        }
                        className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white text-sm rounded-lg shadow hover:from-cyan-500 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                      >
                        ⬇ Download PDF
                      </button>
                    </div>
                    <pre className="text-xs sm:text-sm text-left p-4 bg-gray-700/50 border border-gray-600 rounded-lg max-h-[400px] overflow-auto whitespace-pre-wrap">
                      {info.information.raw}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    No structured or raw data available.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DemoSection;
