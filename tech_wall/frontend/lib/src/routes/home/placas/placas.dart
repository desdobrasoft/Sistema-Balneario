import 'package:flutter/material.dart';
import 'package:tech_wall/src/api/placas/placas.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/placa.dart';
import 'package:tech_wall/src/routes/home/placas/components/table.dart';
// import 'package:tech_wall/src/routes/home/placas/dialogs/add_edit_placa.dart';
import 'package:tech_wall/src/routes/home/placas/dialogs/add_edit_placa.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';

class PlacasView extends StatefulWidget {
  const PlacasView({super.key});

  @override
  State<PlacasView> createState() => _PlacasViewState();
}

class _PlacasViewState extends State<PlacasView> {
  List<Placa> _placas = [];
  List<Placa> _filteredPlacas = [];
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.addListener(_listener);
    _reloadData();
  }

  @override
  void dispose() {
    _controller.removeListener(_listener);
    _controller.dispose();
    super.dispose();
  }

  void _listener() {
    final text = _controller.text.toLowerCase();
    setState(() {
      if (text.isEmpty) {
        _filteredPlacas = List.from(_placas);
      } else {
        _filteredPlacas = _placas
            .where((placa) => placa.nome.toLowerCase().contains(text))
            .toList();
      }
    });
  }

  Future<void> _reloadData() async {
    try {
      final placas = await PlacasApi.listAll();
      setState(() {
        _placas = placas;
        _filteredPlacas = List.from(_placas);
      });
    } catch (e) {
      // Handle error
    }
  }

  Future<void> _addPlaca() async {
    final success = await DialogService.instance.showDialog(
      const AddEditPlacaDialog(),
    );
    if (success == true) _reloadData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Gerenciamento de Placas',
          subtitle: 'Crie e gerencie os modelos de placas da sua empresa',
          content: Padding(
            padding: const EdgeInsets.only(top: gapsm),
            child: Column(
              spacing: gapmd,
              children: [
                Row(
                  spacing: gaplg,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          filled: true,
                          hintText: 'Buscar por nome...',
                          labelText: 'Buscar Placa',
                          prefixIcon: const Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: 'Adicionar Placa',
                      onPressed: _addPlaca,
                      icon: const Icon(Icons.add_box_outlined),
                    ),
                  ],
                ),
                Expanded(
                  child: PlacasTable(
                    data: _filteredPlacas,
                    onDataChange: _reloadData,
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
