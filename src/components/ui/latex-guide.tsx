"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LatexGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Guide d&apos;utilisation LaTeX</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Formules inline :</h4>
          <ul className="text-sm space-y-1">
            <li>• <code>{`$x^2 + y^2 = z^2$`}</code> - Théorème de Pythagore</li>
            <li>• <code>{`$E = mc^2$`}</code> - Formule d&apos;Einstein</li>
            <li>• <code>{`$\frac{a}{b}$`}</code> - Fraction</li>
            <li>• <code>{`$\sqrt{x}$`}</code> - Racine carrée</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Formules centrées :</h4>
          <ul className="text-sm space-y-1">
            <li>• <code>{`$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$`}</code></li>
            <li>• <code>{`$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$`}</code></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Symboles grecs :</h4>
          <ul className="text-sm space-y-1">
            <li>• <code>{`$\alpha, \beta, \gamma, \pi, \theta$`}</code></li>
            <li>• <code>{`$\infty, \pm, \approx$`}</code></li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 