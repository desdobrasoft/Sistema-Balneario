import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gaplg, gapmd, gapsm, gapxxl;
import 'package:sistema_balneario/src/data/mock_data.dart';
import 'package:sistema_balneario/src/enums/window_class.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';
import 'package:sistema_balneario/src/utils/hint_style.dart';

class HouseCatalog extends StatefulWidget {
  const HouseCatalog({super.key});

  @override
  State<HouseCatalog> createState() => _HouseCatalogState();
}

class _HouseCatalogState extends State<HouseCatalog> {
  static const _chartCardHeight = 600;

  final _controller = TextEditingController();

  WindowClass _windowClass = WindowClass.expanded;

  @override
  Widget build(BuildContext context) {
    final newWC = WindowClass.fromWidth(MediaQuery.of(context).size.width);
    if (newWC != _windowClass) {
      setState(() => _windowClass = newWC);
    }

    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: localization(context).catalogCardTitle,
          subtitle: localization(context).catalogCardSubtitle,
          content: Container(
            padding: EdgeInsets.only(top: gapmd),
            width: double.maxFinite,
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
                          hintStyle: hintStyle(context),
                          hintText: localization(context).customerFilterHint,
                          labelText: localization(context).customerFilterLabel,
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: localization(context).catalogAddButtonLabel,
                      onPressed: () {},

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final count = switch (_windowClass) {
                        WindowClass.compact => 1,
                        WindowClass.medium => 1,
                        WindowClass.expanded => 2,
                      };
                      final maxWidth = constraints.maxWidth / count;

                      return GridView.builder(
                        gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(
                          childAspectRatio: maxWidth / _chartCardHeight,
                          crossAxisSpacing: gapxxl,
                          mainAxisSpacing: gapxxl,
                          maxCrossAxisExtent: maxWidth,
                        ),

                        itemCount: houseModels.length,

                        itemBuilder: (context, i) {
                          final model = houseModels[i];

                          return AppCard.outlined(
                            image: AspectRatio(
                              aspectRatio: 600 / 400,
                              child: Placeholder(),
                            ),
                            title: model.name,
                            subtitle: model.description,
                            content: Padding(
                              padding: const EdgeInsets.only(top: gapsm),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.checklist),
                                      Text(
                                        localization(
                                          context,
                                        ).catalogMaterialListLabel,
                                      ),
                                    ],
                                  ),
                                  Wrap(
                                    children: model.materials.map((material) {
                                      return FilterChip(
                                        onSelected: (value) {},
                                        label: Text(material.id),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
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
