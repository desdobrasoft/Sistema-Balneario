import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:tech_wall/src/api/materiais_estoque/materiais_estoque.dart';
import 'package:tech_wall/src/api/pedidos_compra/pedidos_compra.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/pedidos/add_pedido.dart';
import 'package:tech_wall/src/components/responsive_grid.dart';
import 'package:tech_wall/src/constants/constants.dart' show gaplg;
import 'package:tech_wall/src/enums/window_class.dart';
import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/models/material_estoque.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/routes/home/financeiro/components/low_stock_card.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/get_localization.dart';

class FinanceDashboard extends StatefulWidget {
  const FinanceDashboard({super.key, required this.data});

  final List<LancamentoModel> data;

  @override
  State<FinanceDashboard> createState() => _FinanceDashboardState();
}

class _FinanceDashboardState extends State<FinanceDashboard> {
  static const _cardHeight = 100.0;

  List<MaterialEstoqueModel>? _materiais;
  List<PedidoCompraModel>? _pedidos;

  @override
  void initState() {
    super.initState();
    _fetchAuxData();
  }

  Future<void> _fetchAuxData() async {
    final responses = await Future.wait([
      MateriaisEstoqueApi.listAll(),
      PedidosCompraApi.listAll(),
    ]);
    if (mounted) {
      setState(() {
        _materiais = responses[0] as List<MaterialEstoqueModel>;
        _pedidos = responses[1] as List<PedidoCompraModel>;
      });
    }
  }

  Future<void> _showLowStockDialog() async {
    // Lógica para abrir um diálogo com a lista de materiais com estoque baixo
    // e permitir a criação de um pedido.
    final success = await DialogService.instance.showDialog(
      const AddPedidoDialog(),
    );
    if (success == true) _fetchAuxData();
  }

  @override
  Widget build(BuildContext context) {
    final windowClass = WindowClass.fromWidth(
      MediaQuery.of(context).size.width,
    );
    final count = switch (windowClass) {
      WindowClass.compact => 1,
      WindowClass.medium => 2,
      WindowClass.expanded => 4,
    };

    final list = _cards(count);
    list.addAll(
      List.generate(count - list.length % count, (_) => SizedBox.shrink()),
    );

    return ResponsiveGrid(
      crossAxisCount: count,
      runSpacing: gaplg,
      spacing: gaplg,
      children: list,
    );
  }

  List<Widget> _cards(int crossAxisCount) {
    final scheme = ColorScheme.of(context);
    final styles = TextTheme.of(context);
    final currencyFormatter = NumberFormat.currency(
      locale: localization(context).localeName,
      symbol: 'R\$',
    );

    // Total Recebido: Soma do que foi efetivamente pago (valor total - valor pendente) nas receitas.
    final totalRecebido = widget.data
        .where((entry) => entry.tipo == TipoLancamento.receita)
        .map((e) => e.valorTotal - e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // Total Pago: Soma do que foi efetivamente pago (valor total - valor pendente) nas despesas.
    final totalPago = widget.data
        .where((entry) => entry.tipo == TipoLancamento.despesa)
        .map((e) => e.valorTotal - e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // A Receber: Soma de todos os valores pendentes das receitas.
    final aReceber = widget.data
        .where((entry) => entry.tipo == TipoLancamento.receita)
        .map((e) => e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    // A Pagar: Soma de todos os valores pendentes das despesas.
    final aPagar = widget.data
        .where((entry) => entry.tipo == TipoLancamento.despesa)
        .map((e) => e.valorPendente)
        .fold(0.0, (sum, valor) => sum + valor);

    return [
      AppCard.outlined(
        content: SizedBox(
          height: _cardHeight,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text('Total recebido', style: styles.titleMedium),
                  ),
                  Icon(Icons.trending_up, color: Colors.green),
                ],
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: AutoSizeText(
                  currencyFormatter.format(totalRecebido),
                  maxLines: 1,
                  minFontSize: styles.titleLarge?.fontSize ?? 12,
                  overflow: TextOverflow.ellipsis,
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                ),
              ),
            ],
          ),
        ),
      ),
      AppCard.outlined(
        content: SizedBox(
          height: _cardHeight,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text('Total pago', style: styles.titleMedium),
                  ),
                  Icon(Icons.trending_down, color: Colors.red),
                ],
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: AutoSizeText(
                  currencyFormatter.format(totalPago),
                  maxLines: 1,
                  minFontSize: styles.titleLarge?.fontSize ?? 12,
                  overflow: TextOverflow.ellipsis,
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                ),
              ),
            ],
          ),
        ),
      ),
      AppCard.outlined(
        content: SizedBox(
          height: _cardHeight,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Expanded(child: Text('A receber', style: styles.titleMedium)),
                  Icon(Icons.arrow_circle_down_outlined, color: Colors.blue),
                ],
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: AutoSizeText(
                  currencyFormatter.format(aReceber),
                  maxLines: 1,
                  minFontSize: styles.titleLarge?.fontSize ?? 12,
                  overflow: TextOverflow.ellipsis,
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                ),
              ),
            ],
          ),
        ),
      ),
      AppCard.outlined(
        content: SizedBox(
          height: _cardHeight,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Expanded(child: Text('A pagar', style: styles.titleMedium)),
                  Icon(Icons.arrow_circle_up_outlined, color: Colors.orange),
                ],
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: AutoSizeText(
                  currencyFormatter.format(aPagar),
                  maxLines: 1,
                  minFontSize: styles.titleLarge?.fontSize ?? 12,
                  overflow: TextOverflow.ellipsis,
                  style: styles.headlineLarge?.copyWith(color: scheme.primary),
                ),
              ),
            ],
          ),
        ),
      ),
      if (_materiais != null && _pedidos != null)
        LowStockCard(
          materiais: _materiais!,
          pedidos: _pedidos!,
          onTap: _showLowStockDialog,
        )
      else
        const AppCard.outlined(
          content: SizedBox(
            height: _cardHeight,
            child: Center(child: CircularProgressIndicator()),
          ),
        ),
    ];
  }
}
