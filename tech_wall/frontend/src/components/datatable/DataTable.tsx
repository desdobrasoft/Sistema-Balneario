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

interface ReactContainer extends Element {
  _reactRoot?: Root;
}

export interface DTFilter {
  field: string;
  type: number | string;
  value: unknown;
}

export type CustomConfigColumns<T = unknown> = ConfigColumns & {
  reactRender?: (data: unknown, row: T) => React.ReactNode;
};

export interface DataTableProps<T> {
  onFetchData: (
    data: Record<string, unknown>,
    filters?: DTFilter[],
  ) => Promise<unknown>;
  columns: CustomConfigColumns<T>[];
  filters?: DTFilter[];
  rowActions?: (item: T) => React.ReactNode;
  actionColumnWidth?: string | null;
  onError?: (error: unknown) => void;
}

function DataTableFn<T extends object>(
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
  const dt = useRef<InstanceType<typeof DT> | null>(null);

  const latestRowActions = useRef(rowActions);
  const latestOnFetchData = useRef(onFetchData);
  const latestOnError = useRef(onError);
  const latestFilters = useRef(filters);

  useEffect(() => {
    latestRowActions.current = rowActions;
    latestOnFetchData.current = onFetchData;
    latestOnError.current = onError;
    latestFilters.current = filters;
  }, [rowActions, onFetchData, onError, filters]);

  useImperativeHandle(ref, () => ({
    reload: () => {
      dt.current?.ajax.reload(undefined, false);
    },
  }));

  const hasRowActions = !!rowActions;
  const memoizedColumns = useMemo(() => {
    const processedColumns = columns.map((col) => {
      const { reactRender, ...rest } = col;
      if (!reactRender) return rest as ConfigColumns;
      
      return {
        ...rest,
        // Override render to return a placeholder container
        render: () => '<div class="datatable-react-cell-container" style="display:flex; width: 100%; height: 100%; align-items:center;"></div>',
        // Hook into cell creation to mount the React component
        createdCell: function (td: Node, cellData: unknown, rowData: unknown, row: number, colIdx: number) {
          const tdElement = td as HTMLElement;
          const container = tdElement.querySelector('.datatable-react-cell-container');
          if (container) {
            let root = (container as ReactContainer)._reactRoot;
            if (!root) {
              root = createRoot(container);
              (container as ReactContainer)._reactRoot = root;
            }
            root.render(reactRender(cellData, rowData as T));
          }
          
          // Call original createdCell if it existed
          if (rest.createdCell) {
            rest.createdCell.call(this, td as HTMLTableCellElement, cellData, rowData, row, colIdx);
          }
        }
      } as ConfigColumns;
    });

    if (!hasRowActions) return processedColumns;

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
    return [...processedColumns, actionColumn];
  }, [columns, hasRowActions, actionColumnWidth]);

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
        topStart: "pageLength",
        topEnd: "search",
        bottomStart: "info",
        bottomEnd: "paging",
      },
      responsive: true,
      searching: true,
      serverSide: true,
      ajax: async (data, callback) => {
        try {
          const res = await latestOnFetchData.current(
            data as Record<string, unknown>,
            latestFilters.current,
          );
          callback(res);
        } catch (err) {
          if (latestOnError.current) latestOnError.current(err);
          callback({
            draw: (data as { draw: number }).draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
      },
      rowCallback: (row: Node, rowData: unknown) => {
        if (latestRowActions.current) {
          const tr = row as HTMLElement;
          const rowContainer = tr.querySelector(".datatable-action-container");
          if (rowContainer) {
            let root = (rowContainer as ReactContainer)._reactRoot;
            if (!root) {
              root = createRoot(rowContainer);
              (rowContainer as ReactContainer)._reactRoot = root;
            }
            root.render(latestRowActions.current(rowData as T));
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
  }, [memoizedColumns]);

  return <Box ref={containerRef} sx={{ width: "100%" }} />;
}

const DataTable = forwardRef(DataTableFn) as <T extends object>(
  props: DataTableProps<T> & { ref?: React.Ref<{ reload: () => void }> },
) => React.ReactElement;

export default DataTable;
