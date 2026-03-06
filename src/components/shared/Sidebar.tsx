import { FC, useState, useRef, useEffect, useMemo } from "react";
import { useRequestStore } from "../../application/stores/requestStore";
import { useSettingsStore } from "../../application/stores/settingsStore";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "../../infrastructure/storage";

interface GroupedHistory {
  date: string;
  items: (typeof import("../../domain/types").HistoryItem)[];
}

export const Sidebar: FC = () => {
  const {
    history,
    selectRequest,
    collections,
    createCollection,
    deleteCollection,
    loadRequestFromCollection,
    addRequestToCollection,
    deleteRequestFromCollection,
    url,
    method,
    headers,
    params,
    body,
    authType,
    authData,
    deleteFromHistory,
    exportCollections,
    importCollections,
  } = useRequestStore();
  const { showToast } = useSettingsStore();
  const [width, setWidth] = useState<number>(() => 
    loadFromStorage(STORAGE_KEYS.SIDEBAR_WIDTH, { width: 220 }).width
  );
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(),
  );
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showSaveToCollection, setShowSaveToCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportExport, setShowImportExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isResizing = useRef(false);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.url.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections
      .map((c) => ({
        ...c,
        requests: c.requests.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.url.toLowerCase().includes(q) ||
            r.method.toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.requests.length > 0 || c.name.toLowerCase().includes(q));
  }, [collections, searchQuery]);

  const groupedHistory = useMemo((): GroupedHistory[] => {
    if (!filteredHistory || filteredHistory.length === 0) return [];

    const groups: Record<string, typeof filteredHistory> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (timestamp: number): string => {
      const date = new Date(timestamp);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    };

    filteredHistory.forEach((item) => {
      const dateKey = formatDate(item.id);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });

    return Object.entries(groups).map(([date, items]) => ({ date, items }));
  }, [filteredHistory]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SIDEBAR_WIDTH, { width });
  }, [width]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 150 && newWidth <= 400) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName("");
      setShowNewCollection(false);
    }
  };

  const handleSaveToCollection = (collectionId: string) => {
    const collection = collections?.find((c) => c.id === collectionId);
    const exists = collection?.requests.some(
      (r) => r.url === url && r.method === method
    );

    if (exists) {
      showToast("This request already exists in the collection", "error");
      return;
    }

    addRequestToCollection(collectionId, {
      name: url.split("/").pop() || "Untitled",
      method,
      url,
      headers,
      params,
      body,
      authType,
      authData,
    });
    setShowSaveToCollection(false);
  };

  const handleExport = () => {
    exportCollections();
    showToast("Collections exported successfully", "success");
    setShowImportExport(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importCollections(event.target?.result as string);
      showToast("Collections imported successfully", "success");
    };
    reader.readAsText(file);
    setShowImportExport(false);
  };

  return (
    <div
      className="sidebar-container"
      style={{ display: "flex", height: "100%" }}
    >
      <aside className="sidebar" style={{ width: width, flexShrink: 0 }}>
        <div className="sidebar-top">
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span
            className="sidebar-gear"
            onClick={() => setShowImportExport(!showImportExport)}
            title="Import/Export"
          >
            ⚙
          </span>
          {showImportExport && (
            <div className="import-export-menu">
              <div className="import-export-option" onClick={handleExport}>
                Export
              </div>
              <div
                className="import-export-option"
                onClick={() => fileInputRef.current?.click()}
              >
                Import
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={handleImport}
              />
            </div>
          )}
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div
              className="sidebar-label"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>◇ COLLECTIONS</span>
              <span
                className="sidebar-add-btn"
                onClick={() => setShowNewCollection(true)}
                title="New Collection"
              >
                +
              </span>
            </div>

            {showNewCollection && (
              <div className="new-collection-form">
                <input
                  type="text"
                  className="new-collection-input"
                  placeholder="Collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                  autoFocus
                />
                <div className="new-collection-actions">
                  <button
                    className="new-collection-create"
                    onClick={handleCreateCollection}
                  >
                    Create
                  </button>
                  <button
                    className="new-collection-cancel"
                    onClick={() => setShowNewCollection(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {(filteredCollections || []).map((collection) => (
              <div key={collection.id} className="collection-item">
                <div
                  className="collection-header"
                  onClick={() => toggleCollection(collection.id)}
                >
                  <span
                    className={`collection-chevron ${expandedCollections.has(collection.id) ? "expanded" : ""}`}
                  >
                    ▶
                  </span>
                  <span className="collection-name">{collection.name}</span>
                  <span className="collection-count">
                    {searchQuery.trim() 
                      ? collections?.find(c => c.id === collection.id)?.requests.length || 0
                      : collection.requests.length}
                  </span>
                  <span
                    className="collection-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCollection(collection.id);
                    }}
                    title="Delete Collection"
                  >
                    ×
                  </span>
                </div>

                {expandedCollections.has(collection.id) && (
                  <div className="collection-requests">
                    {(
                      searchQuery.trim()
                        ? collections?.find(c => c.id === collection.id)?.requests || []
                        : collection.requests
                    ).map((request) => (
                      <div
                        key={request.id}
                        className="collection-request-item"
                        onClick={() =>
                          loadRequestFromCollection(collection.id, request.id)
                        }
                      >
                        <span
                          className={`method-badge badge-${request.method.toLowerCase()}`}
                        >
                          {request.method}
                        </span>
                        <span className="sidebar-path">
                          {request.name || request.url}
                        </span>
                        <span
                          className="request-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRequestFromCollection(collection.id, request.id);
                          }}
                          title="Delete Request"
                        >
                          ×
                        </span>
                      </div>
                    ))}
                    {(
                      searchQuery.trim()
                        ? collections?.find(c => c.id === collection.id)?.requests.length || 0
                        : collection.requests.length
                    ) === 0 && (
                      <div className="collection-empty">No requests</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(!filteredCollections || filteredCollections.length === 0) && !showNewCollection && (
              <div className="sidebar-empty">No collections</div>
            )}

            {url && !searchQuery && (
              <div
                className="save-to-collection-btn"
                onClick={() => setShowSaveToCollection(true)}
              >
                + Save Current Request
              </div>
            )}

            {showSaveToCollection && (
              <div className="save-to-collection-modal">
                <div className="save-to-collection-header">
                  Save to Collection
                </div>
                {(collections || []).map((collection) => (
                  <div
                    key={collection.id}
                    className="save-to-collection-option"
                    onClick={() => handleSaveToCollection(collection.id)}
                  >
                    {collection.name}
                  </div>
                ))}
                {(!collections || collections.length === 0) && (
                  <div className="save-to-collection-empty">
                    No collections
                  </div>
                )}
                <button
                  className="save-to-collection-close"
                  onClick={() => setShowSaveToCollection(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section sidebar-history">
            <div className="sidebar-label">◇ RECENT</div>

            {groupedHistory.map((group) => (
              <div key={group.date} className="history-group">
                <div className="history-date-label">{group.date}</div>
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="sidebar-item"
                    onClick={() => selectRequest(item.url, item.method)}
                  >
                    <span
                      className={`method-badge badge-${item.method.toLowerCase()}`}
                    >
                      {item.method}
                    </span>
                    <span className="sidebar-path">{item.url}</span>
                    <span
                      className="history-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFromHistory(item.id);
                      }}
                      title="Remove from history"
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>
            ))}

            {(!filteredHistory || filteredHistory.length === 0) && (
              <div className="sidebar-empty">
                {searchQuery ? "No results" : "No history"}
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="sidebar-resizer" onMouseDown={handleMouseDown} />
    </div>
  );
};
