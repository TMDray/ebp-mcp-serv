# Démarrage Projet Simple - Approche MVP

Lancer un nouveau projet en commençant par le minimum viable et en évoluant itérativement.

## Instructions

### 1. **Définition du Projet**
Pour le projet : **$ARGUMENTS**

#### Clarification Initiale
- **Objectif principal** : Quel est le besoin #1 à résoudre ?
- **Utilisateur cible** : Qui va utiliser cette solution ?
- **Critère de succès** : Comment savoir que ça marche ?
- **Contraintes** : Temps, technologie, ressources

#### Principe MVP
> "Quelle est la version la plus simple qui apporte de la valeur ?"

### 2. **Architecture Minimale**

#### Stack Technique Simple
```yaml
Préférer:
  - Technologies connues vs nouvelles technologies
  - Solutions éprouvées vs innovations
  - Dépendances minimales vs features riches
  - Configuration simple vs optimisation prématurée

Éviter:
  - Microservices pour premier MVP
  - Frameworks complexes sans besoin avéré
  - Optimisations prématurées
  - Abstractions génériques inutiles
```

#### Structure Projet Type
```
nouveau-projet/
├── src/
│   ├── index.ts          # Point d'entrée
│   ├── core.ts           # Logique principale
│   └── utils.ts          # Utilitaires de base
├── tests/
│   └── core.test.ts      # Tests essentiels
├── package.json          # Dépendances minimales
├── tsconfig.json         # Configuration de base
├── README.md             # Documentation minimale
└── .claude/              # Contexte évolutif
    └── CLAUDE.md         # Vision et état
```

### 3. **Planification en 3 Phases**

#### Phase 1: Preuve de Concept (1-2 jours)
**Objectif** : Valider que l'approche technique fonctionne
- [ ] Configuration minimale qui compile/build
- [ ] Une fonctionnalité de base qui marche
- [ ] Un test qui prouve que ça fonctionne
- [ ] Documentation de ce qui a été appris

#### Phase 2: MVP Fonctionnel (3-5 jours)
**Objectif** : Solution utilisable pour le cas d'usage principal
- [ ] Interface utilisateur de base
- [ ] Gestion d'erreurs robuste
- [ ] Tests pour les cas critiques
- [ ] Documentation utilisateur minimale

#### Phase 3: Amélioration Itérative (ongoing)
**Objectif** : Améliorer basé sur feedback et usage réel
- [ ] Métriques d'usage et performance
- [ ] Feedback utilisateurs collecté
- [ ] Optimisations basées sur données réelles
- [ ] Features additionnelles justifiées

### 4. **Checklist Phase 1 : Preuve de Concept**

#### Setup Technique
- [ ] **Environment** : Node.js, TypeScript configurés
- [ ] **Build** : `npm run build` fonctionne
- [ ] **Test** : `npm test` passe (même un test basique)
- [ ] **Run** : L'application démarre sans erreur

#### Fonctionnalité Minimale
- [ ] **Input** : Accepte le plus simple input possible
- [ ] **Process** : Fait la transformation/action la plus basique
- [ ] **Output** : Produit un résultat observable
- [ ] **Test** : Valide que input → output fonctionne

#### Documentation Initiale
```markdown
# [Nom du Projet]

## Objectif
[En 1 phrase : que fait ce projet]

## Usage
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

## Status
- ✅ Preuve de concept fonctionnelle
- ⏳ MVP en développement
- ❌ Production

## Apprentissages
[Ce qui a été appris pendant la phase 1]
```

### 5. **Patterns de Démarrage Éprouvés**

#### Pattern : Test-Driven Start
```typescript
// 1. Commencer par le test
describe('Core functionality', () => {
  test('should do the main thing', () => {
    const result = doMainThing(basicInput);
    expect(result).toEqual(expectedOutput);
  });
});

// 2. Implémenter le minimum qui fait passer le test
export function doMainThing(input: BasicInput): ExpectedOutput {
  // Version la plus simple qui marche
  return { success: true, data: input };
}
```

#### Pattern : Configuration Externalisée
```typescript
// config.ts - Tout configurable dès le début
export const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DB_URL || 'sqlite::memory:',
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

#### Pattern : Gestion d'Erreurs Basique
```typescript
// errors.ts - Gestion uniforme dès le début
export class AppError extends Error {
  constructor(message: string, public code: string = 'GENERIC') {
    super(message);
  }
}

export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue';
}
```

### 6. **Anti-Patterns à Éviter Absolument**

#### 🚫 Over-Engineering Initial
```typescript
// ❌ Ne PAS faire ça au début
class AbstractFactoryManagerSingleton<T extends Serializable> {
  private static instances = new Map();
  // 200 lignes de code générique...
}

// ✅ Faire ça plutôt
function createThing(input: string): Thing {
  return { name: input, id: Date.now() };
}
```

#### 🚫 Abstractions Prématurées
```typescript
// ❌ Pas besoin d'interface au début
interface DataProvider<T> {
  get<K>(key: K): Promise<T>;
  set<K, V>(key: K, value: V): Promise<void>;
  // Plus d'interfaces que de code...
}

// ✅ Commencer concret
const data = new Map<string, any>();
```

### 7. **Validation de Phase**

#### Critères de Passage Phase 1 → Phase 2
- [ ] L'application démarre et s'arrête proprement
- [ ] Une fonctionnalité end-to-end fonctionne
- [ ] Les tests passent (même basiques)
- [ ] Au moins une personne autre que l'auteur peut faire tourner
- [ ] Documentation minimale présente

#### Red Flags (Ne PAS passer à Phase 2)
- ❌ Build instable ou long (>30 secondes)
- ❌ Tests qui échouent de manière intermittente
- ❌ Configuration complexe nécessaire
- ❌ Plus de code que de fonctionnalités
- ❌ Aucune validation utilisateur

### 8. **Documentation d'Apprentissages**

#### Template Post-Phase 1
```markdown
## Phase 1 Completée - [Date]

### Ce qui a marché
- [Décisions techniques qui ont facilité le développement]
- [Patterns qui ont accéléré le processus]

### Ce qui a été difficile
- [Blocages rencontrés et comment ils ont été résolus]
- [Assumptions incorrectes]

### Prochaines étapes Phase 2
- [3-5 fonctionnalités prioritaires]
- [Risques techniques identifiés]

### Métriques
- Temps Phase 1: [X heures]
- LOC: [Nombre de lignes]
- Tests: [Nombre]
- Dépendances: [Nombre]
```

### 9. **Workflow Itératif**

#### Cycle Quotidien
1. **Morning** : Définir objectif de la journée (1 feature)
2. **Code** : Implémenter version la plus simple
3. **Test** : Valider que ça marche
4. **Evening** : Documenter apprentissages

#### Cycle Hebdomadaire
1. **Lundi** : Planifier features de la semaine
2. **Mercredi** : Point mi-parcours, ajuster si nécessaire  
3. **Vendredi** : Demo interne, feedback, planifier semaine suivante

## Mantras du Démarrage Simple

- **"Make it work, make it right, make it fast"** - Dans cet ordre
- **"You aren't gonna need it"** - Pas de features "au cas où"
- **"Perfect is the enemy of good"** - MVP imparfait > perfection paralysante
- **"Iterate don't elaborate"** - Cycles courts avec feedback

## Success Stories

> Le projet qui réussit n'est pas celui qui a la meilleure architecture au départ,  
> mais celui qui évolue le plus rapidement basé sur le feedback réel.