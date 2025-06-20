import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart' show customers;
import 'package:sistema_balneario/src/models/customer.dart';
import 'package:sistema_balneario/src/routes/home/customers/components/table.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';
import 'package:sistema_balneario/src/utils/hint_style.dart';

class Customers extends StatefulWidget {
  const Customers({super.key});

  @override
  State<Customers> createState() => _CustomersState();
}

class _CustomersState extends State<Customers> {
  final _controller = TextEditingController();

  List<CustomerModel> _filteredData = List.from(customers);

  @override
  void initState() {
    super.initState();
    _controller.addListener(_listener);
  }

  @override
  void dispose() {
    super.dispose();
    _controller.removeListener(_listener);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: localization(context).customersCardTitle,
          subtitle: localization(context).customersCardSubtitle,
          content: Padding(
            padding: const EdgeInsets.only(top: gapmd),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Row(
                  spacing: gaplg,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          filled: true,
                          hintStyle: hintStyle(context),
                          hintText: localization(context).customerFilterHint,
                          labelText: localization(context).customerFilterLabel,
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: localization(context).customersAddButtonLabel,
                      onPressed: () {},

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(child: CustomersTable(data: _filteredData)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _listener() {
    final text = _controller.text;
    if (text.isEmpty) {
      setState(() {
        _filteredData = customers;
      });
      return;
    }
    setState(() {
      _filteredData = customers
          .where(
            (customer) =>
                customer.address.contains(text) ||
                customer.email.contains(text) ||
                customer.name.contains(text) ||
                customer.phone.contains(text) ||
                customer.salesHistoryCount.toString().contains(text),
          )
          .toList();
    });
  }
}
