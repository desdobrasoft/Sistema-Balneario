import DT, { type ConfigColumns } from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt";
import "datatables.net-select-dt";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { createRoot, type Root } from "react-dom/client";

import Box from "@mui/material/Box";

export interface DTFilter {
  field: string;
  type: number | string;
  value: any;
}

export interface DataTableProps<T> {
  onFetchData: (data: any, filters?: DTFilter[]) => Promise<any>;
  columns: ConfigColumns[];
  filters?: DTFilter[];
  rowActions?: (item: T) => React.ReactNode;
  actionColumnWidth?: string | null;
  onError?: (error: any) => void;
}

function DataTableFn<T extends { [key: string]: any }>(
  {
    onFetchData,
    columns,
    filters = [],
    rowActions,
    actionColumnWidth,
    onError,
  }: DataTableProps<T>,
  ref: React.Ref<{ reload: () => void }>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dt = useRef<any | null>(null);

  useImperativeHandle(ref, () => ({
    reload: () => {
      dt.current?.ajax.reload(null, false);
    },
  }));

  const memoizedColumns = useMemo(() => {
    if (!rowActions) return columns;

    const actionColumn: ConfigColumns = {
      title: "Ações",
      data: null,
      width: actionColumnWidth === null ? undefined : actionColumnWidth || "1%",
      orderable: false,
      searchable: false,
      className: "datatable-action-column",
      render: () =>
        '<div class="datatable-action-container" style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;"></div>',
    };
    return [...columns, actionColumn];
  }, [columns, rowActions, actionColumnWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a fresh <table> element for each mount cycle.
    // This avoids StrictMode issues: DT attaches metadata to the DOM element itself,
    // and reusing a stale element with detached wrappers causes "nTableWrapper is null".
    const tableEl = document.createElement("table");
    tableEl.className = "display";
    tableEl.style.width = "100%";
    container.appendChild(tableEl);

    dt.current = new DT(tableEl, {
      autoWidth: false,
      columns: memoizedColumns,
      language: {
        url: "https://cdn.datatables.net/plug-ins/2.3.3/i18n/pt-BR.json",
      },
      layout: {
        topStart: 'pageLength', topEnd: 'search',
        bottomStart: 'info', bottomEnd: 'paging'
      },
      responsive: true,
      searching: true,
      serverSide: true,
      ajax: async (data, callback) => {
        try {
          const res = await onFetchData(data, filters);
          callback(res);
        } catch (err) {
          if (onError) onError(err);
          callback({
            draw: (data as { draw: number }).draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
      },
      rowCallback: (row: Node, rowData: any) => {
        if (rowActions) {
          const tr = row as HTMLElement;
          const rowContainer = tr.querySelector(".datatable-action-container");
          if (rowContainer) {
            let root = (rowContainer as any)._reactRoot as Root | undefined;
            if (!root) {
              root = createRoot(rowContainer);
              (rowContainer as any)._reactRoot = root;
            }
            root.render(rowActions(rowData as T));
          }
        }
      },
    });

    return () => {
      try {
        dt.current?.destroy();
      } catch {
        // noop – DOM may already be detached (StrictMode)
      }
      dt.current = null;
      // Remove the table and any DT-generated wrappers from the container
      container.innerHTML = "";
    };
  }, [memoizedColumns, onFetchData, JSON.stringify(filters), onError, rowActions]);

  return <Box ref={containerRef} sx={{ width: "100%" }} />;
}

const DataTable = forwardRef(DataTableFn) as <T extends { [key: string]: any }>(
  props: DataTableProps<T> & { ref?: React.Ref<{ reload: () => void }> },
) => React.ReactElement;

export default DataTable;
