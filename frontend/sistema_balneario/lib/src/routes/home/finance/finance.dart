import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gapmd, gapsm, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart';
import 'package:sistema_balneario/src/models/account_entry_model.dart';
import 'package:sistema_balneario/src/routes/home/finance/components/account_entries.dart';
import 'package:sistema_balneario/src/routes/home/finance/components/dashboard.dart';
import 'package:sistema_balneario/src/routes/home/finance/components/invoices.dart';

class Finance extends StatefulWidget {
  const Finance({super.key});

  @override
  State<Finance> createState() => _FinanceState();
}

class _FinanceState extends State<Finance> with SingleTickerProviderStateMixin {
  static const double _tabHeight = 40;

  final _data = List<AccountEntryModel>.from(accountEntries, growable: false);

  late TabController _tabController;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(length: 3, vsync: this);

    for (var entry in _data) {
      final index = sales.indexWhere((sale) => sale.id == entry.relatedSaleId);
      if (index >= 0) {
        entry.sale = sales[index];
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Módulo Financeiro',
          subtitle:
              'Gerencie suas finanças, contas a pagar/receber e notas fiscais',
          content: Padding(
            padding: const EdgeInsets.only(top: gapsm),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              spacing: gapmd,
              children: [
                TabBar(
                  controller: _tabController,

                  tabs: [
                    Container(
                      alignment: Alignment.center,
                      height: _tabHeight,
                      child: Text('Painel financeiro'),
                    ),
                    Container(
                      alignment: Alignment.center,
                      height: _tabHeight,
                      child: Text('Lançamentos'),
                    ),
                    Container(
                      alignment: Alignment.center,
                      height: _tabHeight,
                      child: Text('Notas fiscais'),
                    ),
                  ],
                ),
                Flexible(
                  child: ListenableBuilder(
                    listenable: _tabController,
                    builder: (context, child) => switch (_tabController.index) {
                      0 => FinanceDashboard(data: _data),
                      1 => AccountEntries(data: _data),
                      2 => Invoices(),
                      _ => FinanceDashboard(data: _data),
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
