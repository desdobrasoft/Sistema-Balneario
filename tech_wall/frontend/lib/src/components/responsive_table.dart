import 'dart:async' show FutureOr;

import 'package:flutter/material.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class ResponsiveTable extends StatefulWidget {
  final List<ResponsiveRow> rows;
  final List<ResponsiveColumn>? columns;
  final TextStyle? dataStyle;
  final TextStyle? headerStyle;
  final String? actionsLabel;
  final double minColumnWidth;

  const ResponsiveTable({
    super.key,
    required this.rows,
    this.columns,
    this.dataStyle,
    this.headerStyle,
    this.actionsLabel,
    this.minColumnWidth = 150,
  });

  @override
  State<ResponsiveTable> createState() => _ResponsiveTableState();
}

class _ResponsiveTableState extends State<ResponsiveTable> {
  static const double _defaultFontSize = 12;
  static const double _defaultLineHeight = 1.3;

  final Map<int, bool> _expandedRows = {};

  late TextStyle? _dataStyle;
  late TextStyle? _headerStyle;

  int _columnsToShow = 0;

  bool _ascending = true;
  int? _sortIndex;

  @override
  Widget build(BuildContext context) {
    final columns = widget.columns;
    final totalColumns =
        widget.columns?.length ?? widget.rows.firstOrNull?.cells.length ?? 1;

    final defaultDataStyle = TextTheme.of(
      context,
    ).bodyMedium?.copyWith(fontWeight: FontWeight.normal);
    final defaultHeaderStyle = TextTheme.of(
      context,
    ).labelLarge?.copyWith(fontWeight: FontWeight.bold);

    _dataStyle = widget.dataStyle ?? defaultDataStyle;
    _headerStyle = widget.headerStyle ?? defaultHeaderStyle;

    final headerHeight =
        2 *
        (_headerStyle?.fontSize ?? _defaultFontSize) *
        (_headerStyle?.height ?? _defaultLineHeight);

    return LayoutBuilder(
      builder: (context, constraints) {
        final availableWidth = constraints.maxWidth;
        const actionColumnWidth = 100.0;
        double columnWidth =
            (availableWidth - actionColumnWidth) / totalColumns;

        _columnsToShow = totalColumns;
        while (_columnsToShow > 1 && columnWidth < widget.minColumnWidth) {
          _columnsToShow--;
          columnWidth = (availableWidth - actionColumnWidth) / _columnsToShow;
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (columns != null)
              _buildHeader(columns, columnWidth, _headerStyle, headerHeight),
            Flexible(
              child: ListView.builder(
                itemCount: widget.rows.length,
                shrinkWrap: true,
                itemBuilder: (context, rowIndex) {
                  final row = widget.rows[rowIndex];
                  final showMore = totalColumns > _columnsToShow;
                  return Column(
                    children: [
                      Row(
                        children: [
                          for (int i = 0; i < _columnsToShow; i++)
                            _buildCell(
                              row.cells[i],
                              _dataStyle,
                              columnWidth,
                              row.color,
                            ),
                          _buildActionsCell(
                            row.actions,
                            showMore
                                ? () {
                                    setState(() {
                                      _expandedRows[rowIndex] =
                                          !(_expandedRows[rowIndex] ?? false);
                                    });
                                  }
                                : null,
                            actionColumnWidth,
                            row.color,
                          ),
                        ],
                      ),
                      if (_expandedRows[rowIndex] == true)
                        Column(
                          children: [
                            for (int i = _columnsToShow; i < totalColumns; i++)
                              Container(
                                decoration: BoxDecoration(
                                  border: Border(
                                    top: BorderSide(
                                      color: ColorScheme.of(
                                        context,
                                      ).outlineVariant.withAlpha(130),
                                      width: 1,
                                    ),
                                  ),
                                  color: row.cells[i].color ?? row.color,
                                ),
                                width: double.maxFinite,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 4,
                                  horizontal: 8,
                                ),
                                child: Text.rich(
                                  TextSpan(
                                    children: [
                                      if (columns?[i] != null)
                                        TextSpan(
                                          text: '${columns![i].label}: ',
                                          style: _headerStyle,
                                        ),
                                      TextSpan(
                                        text: '${row.cells[i].data}',
                                        style: _dataStyle,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                          ],
                        ),
                      if (rowIndex < widget.rows.length - 1)
                        const Divider(height: 1),
                    ],
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildHeader(
    List<ResponsiveColumn> columns,
    double columnWidth,
    TextStyle? style,
    double height,
  ) {
    return Row(
      children: [
        for (int i = 0; i < _columnsToShow; i++)
          InkWell(
            onTap: () async {
              final column = columns[i];
              if (column.onSort == null) return;
              final asc = _sortIndex == i ? !_ascending : true;
              await column.onSort!(i, asc);
              setState(() {
                _ascending = asc;
                _sortIndex = i;
              });
            },
            child: Container(
              width: columnWidth,
              padding: const EdgeInsets.all(8),
              color: Colors.transparent,
              alignment: _isNumber(widget.rows.firstOrNull?.cells[i].data)
                  ? Alignment.centerRight
                  : Alignment.centerLeft,
              child: SizedBox(
                height: height,
                width: double.maxFinite,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  textDirection:
                      _isNumber(widget.rows.firstOrNull?.cells[i].data)
                      ? TextDirection.rtl
                      : TextDirection.ltr,
                  children: [
                    Flexible(
                      child: Text(
                        columns[i].label,
                        style: style,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        textAlign:
                            _isNumber(widget.rows.firstOrNull?.cells[i].data)
                            ? TextAlign.right
                            : TextAlign.left,
                      ),
                    ),
                    if (_sortIndex == i)
                      Icon(
                        _ascending ? Icons.arrow_upward : Icons.arrow_downward,
                        size: 16,
                      ),
                  ],
                ),
              ),
            ),
          ),
        Container(
          width: 100,
          padding: const EdgeInsets.all(8),
          child: Text(
            widget.actionsLabel ?? localization(context).tableActionsLabel,
            style: style,
          ),
        ),
      ],
    );
  }

  Widget _buildCell(
    ResponsiveCell cell,
    TextStyle? style,
    double width,
    Color? rowColor,
  ) {
    final height =
        3 *
        (style?.fontSize ?? _defaultFontSize) *
        (style?.height ?? _defaultLineHeight);

    return Container(
      width: width,
      padding: const EdgeInsets.all(8),
      color: cell.color ?? rowColor,
      child: Container(
        alignment: _isNumber(cell.data)
            ? Alignment.centerRight
            : Alignment.centerLeft,
        height: height,
        child: Text(
          cell.data.toString(),
          style: style,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
          textAlign: _isNumber(cell.data) ? TextAlign.right : TextAlign.left,
        ),
      ),
    );
  }

  Widget _buildActionsCell(
    List<PopupMenuEntry> actions,
    VoidCallback? onShowHidden,
    double width,
    Color? rowColor,
  ) {
    final height =
        3 *
        (_dataStyle?.fontSize ?? _defaultFontSize) *
        (_dataStyle?.height ?? _defaultLineHeight);

    return Container(
      width: width,
      padding: const EdgeInsets.all(8),
      color: rowColor,
      child: SizedBox(
        height: height,
        child: Row(
          children: [
            PopupMenuButton(itemBuilder: (context) => actions),
            if (onShowHidden != null)
              IconButton(
                icon: const Icon(Icons.keyboard_arrow_down),
                onPressed: onShowHidden,
              ),
          ],
        ),
      ),
    );
  }

  bool _isNumber(Object? source) => double.tryParse('$source') != null;
}

class ResponsiveRow {
  final List<ResponsiveCell> cells;
  final List<PopupMenuEntry> actions;
  final Color? color;

  const ResponsiveRow({
    required this.cells,
    this.actions = const [],
    this.color,
  });
}

class ResponsiveCell {
  final Object? data;
  final Color? color;

  const ResponsiveCell(this.data, {this.color});
}

class ResponsiveColumn {
  final String label;
  final FutureOr<void> Function(int columnIndex, bool ascending)? onSort;

  const ResponsiveColumn({required this.label, this.onSort});
}
