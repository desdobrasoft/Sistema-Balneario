import 'package:flutter/material.dart';

enum _Variant { normal, mini }

class DrawerLogo extends StatelessWidget {
  final _Variant _variant;

  const DrawerLogo({super.key}) : _variant = _Variant.normal;

  const DrawerLogo.mini({super.key}) : _variant = _Variant.mini;

  @override
  Widget build(BuildContext context) {
    return switch (_variant) {
      _Variant.normal => SizedBox(
        height: 80,
        child: Placeholder(
          child: Center(child: Text('Logo', textAlign: TextAlign.center)),
        ),
      ),
      _Variant.mini => SizedBox(
        height: 50,
        child: Placeholder(
          child: Center(
            child: Text('Logo (mini)', textAlign: TextAlign.center),
          ),
        ),
      ),
    };
  }
}
