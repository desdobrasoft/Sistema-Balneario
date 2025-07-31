import 'package:casa_facil/src/api/lancamentos/lancamentos.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart';
import 'package:casa_facil/src/models/lancamento.dart';
import 'package:casa_facil/src/routes/home/financeiro/components/dashboard.dart';
import 'package:casa_facil/src/routes/home/financeiro/components/invoices.dart';
import 'package:casa_facil/src/routes/home/financeiro/components/lancamentos.dart';
import 'package:flutter/material.dart';

class Finance extends StatefulWidget {
  const Finance({super.key});

  @override
  State<Finance> createState() => _FinanceState();
}

class _FinanceState extends State<Finance> with SingleTickerProviderStateMixin {
  static const double _tabHeight = 40;
  late TabController _tabController;
  final _notifier = ValueNotifier(false);
  List<LancamentoModel> _data = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _reloadData());
  }

  @override
  void dispose() {
    _tabController.dispose();
    _notifier.dispose();
    super.dispose();
  }

  Future<void> _reloadData() async {
    _data = await LancamentosApi.listAll();
    _notifier.value = !_notifier.value;
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
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Painel financeiro'),
                    ),
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Lançamentos'),
                    ),
                    Container(
                      height: _tabHeight,
                      alignment: Alignment.center,
                      child: const Text('Notas fiscais'),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, child) => TabBarView(
                      controller: _tabController,
                      children: [
                        FinanceDashboard(data: _data),
                        Lancamentos(data: _data, onDataChange: _reloadData),
                        Invoices(),
                      ],
                    ),
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
