import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show px8;
import 'package:sistema_balneario/src/models/customer.dart';
import 'package:sistema_balneario/src/utils/legible_color.dart';

class CustomersTable extends StatefulWidget {
  const CustomersTable({super.key, required this.data});

  final List<CustomerModel> data;

  @override
  State<CustomersTable> createState() => _CustomersTableState();
}

class _CustomersTableState extends State<CustomersTable> {
  static const double _actionIconSize = 30;
  static const int _maxLines = 3;

  late TextStyle _style;

  @override
  Widget build(BuildContext context) {
    _style =
        TextTheme.of(context).labelLarge ??
        TextStyle(fontSize: 12, height: 1.3);
    final maxHeight = _maxLines * _style.fontSize! * _style.height! + px8;

    return DataTable(
      dataRowMaxHeight: maxHeight,
      dataRowMinHeight: maxHeight - 1,
      columns: [
        _column('Nome'),
        _column('Email'),
        _column('Telefone'),
        _column('Endereço'),
        _column('Vendas'),
        _column('Ações'),
      ],
      rows: widget.data.map((customer) {
        return DataRow(
          cells: [
            _cell(customer.name),
            _cell(customer.email),
            _cell(customer.phone),
            _cell(customer.address),
            _cell('${customer.salesHistoryCount}'),
            DataCell(
              Row(
                mainAxisSize: MainAxisSize.min,
                spacing: px8,
                children: [
                  SizedBox.square(
                    dimension: _actionIconSize,
                    child: AppButton(onPressed: () {}, icon: Icon(Icons.edit)),
                  ),
                  SizedBox.square(
                    dimension: _actionIconSize,
                    child: AppButton(
                      backgroundColor: Colors.red,
                      foregroundColor: legibleColor(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.red,
                      ),
                      onPressed: () {},
                      icon: Icon(Icons.delete),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      }).toList(),
    );
  }

  DataColumn _column(String label) {
    return DataColumn(
      label: Text(label, style: _style.copyWith(fontWeight: FontWeight.bold)),
    );
  }

  DataCell _cell(String data) {
    return DataCell(
      Text(
        data,
        maxLines: _maxLines,
        overflow: TextOverflow.ellipsis,
        style: _style.copyWith(fontWeight: FontWeight.normal),
      ),
    );
  }
}
