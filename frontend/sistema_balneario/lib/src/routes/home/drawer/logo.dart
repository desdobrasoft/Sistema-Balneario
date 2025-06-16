import 'package:flutter/material.dart';

class DrawerLogo extends StatelessWidget {
  const DrawerLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 80,
      child: Placeholder(child: Center(child: Text('Logo'))),
    );
  }
}
