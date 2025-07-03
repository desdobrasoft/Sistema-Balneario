import 'package:casa_facil/src/api/users.dart';
import 'package:casa_facil/src/components/button.dart';
import 'package:casa_facil/src/components/card.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:casa_facil/src/models/user.dart';
import 'package:casa_facil/src/routes/home/users/components/table.dart';
import 'package:casa_facil/src/utils/get_localization.dart';
import 'package:casa_facil/src/utils/hint_style.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show DateFormat;

class Users extends StatefulWidget {
  const Users({super.key});

  @override
  State<Users> createState() => _UsersState();
}

class _UsersState extends State<Users> {
  final _controller = TextEditingController();

  late final List<UserModel> _origin;

  final _notifier = ValueNotifier(false);

  List<UserModel> _filteredData = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final formatter = DateFormat.yMd(
        localization(context).localeName,
      ).add_Hms();
      _origin = (await UsersApi.listAll()).map((user) {
        final createdDate = DateTime.tryParse(user.createdAt.toString());
        final updatedDate = DateTime.tryParse(user.updatedAt.toString());

        return UserModel(
          createdAt: createdDate == null
              ? 'N/A'
              : formatter.format(createdDate),
          email: user.email ?? 'N/A',
          id: user.id,
          isActive: user.isActive,
          updatedAt: updatedDate == null
              ? 'N/A'
              : formatter.format(updatedDate),
          username: user.username ?? 'N/A',
        );
      }).toList();
      _filteredData = List.from(_origin);
      _notifier.value = !_notifier.value;
    });
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
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return UsersTable(data: _filteredData);
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

  void _listener() {
    final text = _controller.text;
    if (text.isEmpty) {
      setState(() {
        _filteredData = _origin;
      });
      return;
    }
    setState(() {
      _filteredData = _origin
          .where(
            (user) =>
                user.username?.contains(text) == true ||
                user.email?.contains(text) == true ||
                user.isActive.toString().contains(text) ||
                user.createdAt?.toString().contains(text) == true ||
                user.updatedAt?.toString().contains(text) == true,
          )
          .toList();
    });
  }
}
