import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart' show px16, px24;
import 'package:sistema_balneario/src/data/mock_data.dart' show customers;
import 'package:sistema_balneario/src/routes/home/customers/components/table.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';

class Customers extends StatefulWidget {
  const Customers({super.key});

  @override
  State<Customers> createState() => _CustomersState();
}

class _CustomersState extends State<Customers> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(px24).copyWith(top: 0),
        child: AppCard(
          title: localization(context).customersCardTitle,
          subtitle: localization(context).customersCardSubtitle,
          content: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              Row(
                spacing: px16,
                children: [
                  Expanded(child: TextField()),
                  AppButton(
                    label: localization(context).customersAddButtonLabel,
                    onPressed: () {},

                    icon: Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
              CustomersTable(data: customers),
            ],
          ),
        ),
      ),
    );
  }
}
