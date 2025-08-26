# Création de Code - Approche Itérative

Créer du code en suivant les patterns validés et l'architecture existante.

## Instructions

### 1. **Analyse du Contexte Technique**
Consulte obligatoirement avant de coder :
- **`.claude/context/technical.md`** - Architecture et décisions techniques
- **`.claude/context/patterns.md`** - Patterns de code validés
- **`.claude/CLAUDE.md`** - État des composants existants
- **Code existant similaire** dans le projet

### 2. **Spécification de la Fonctionnalité**
Pour la fonctionnalité : **$ARGUMENTS**

1. **Définir clairement** :
   - Inputs attendus
   - Outputs souhaités
   - Cas d'erreur à gérer
   - Performance requise

2. **Identifier les patterns applicables** :
   - Y a-t-il du code similaire dans le projet ?
   - Quels patterns de `context/patterns.md` s'appliquent ?
   - Quelle architecture respecter ?

### 3. **Implémentation Minimale**
Suivre le principe "Make it work, make it right, make it fast" :

1. **Version fonctionnelle minimale** d'abord
   - Plus simple implémentation qui marche
   - Tests de base pour valider
   - Pas d'optimisation prématurée

2. **Respecter les conventions** :
   - Style de code du projet
   - Patterns architecturaux validés
   - Gestion d'erreurs standardisée
   - Types TypeScript appropriés

### 4. **Structure Type selon l'Architecture**
Basé sur `context/technical.md`, utiliser :

```typescript
// Pattern Tool MCP (si applicable)
export const nouveauTool = createTool(
  'nom_tool',
  ValidationSchema,
  async (input) => {
    // 1. Validation business
    // 2. Logique métier
    // 3. Format réponse
  }
);

// Pattern Module Standard
export class NouveauModule {
  constructor(private config: Config) {}
  
  async methodePublique(params: Input): Promise<Output> {
    try {
      // Implémentation
    } catch (error) {
      throw handleError(error);
    }
  }
}
```

### 5. **Validation et Tests**
1. **Test unitaire minimal** qui valide le fonctionnement
2. **Test d'intégration** si interactions avec autres composants
3. **Vérification** que ça n'impacte pas l'existant

### 6. **Documentation et Évolution**
1. **Documenter** dans `logs/learnings.md` :
   ```markdown
   ### Nouveau Code: [Nom]
   **Date:** [Date]
   **Type:** [Tool/Module/Fonction]
   **Pattern utilisé:** [Pattern de context/patterns.md]
   **Complexité:** [Simple/Moyenne/Complexe]
   **Temps développement:** [X heures]
   **Tests:** [Oui/Non + type]
   ```

2. **Nouveau pattern identifié ?**
   - Ajouter dans `context/patterns.md`
   - Mettre à jour `context/technical.md` si architecture impactée

### 7. **Checklist Pré-Commit**
- [ ] Code suit les conventions du projet
- [ ] Pas de secrets/mots de passe en dur
- [ ] Gestion d'erreurs appropriée
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Pattern documenté si réutilisable

## Principes de Développement
- **Simple d'abord** : Solution la plus simple qui fonctionne
- **Patterns existants** : Réutiliser avant d'inventer
- **Tests early** : Tester dès que ça compile
- **Documenter toujours** : Chaque nouveau code enrichit le contexte

## Réutilisation de Patterns
Privilégier dans l'ordre :
1. **Pattern exact** déjà validé dans le projet
2. **Adaptation** d'un pattern proche
3. **Pattern générique** de la stack technique
4. **Nouveau pattern** uniquement si nécessaire

## Anti-Patterns à Éviter
- ❌ Commencer par du code complexe
- ❌ Ignorer les conventions existantes
- ❌ Pas de gestion d'erreurs
- ❌ Copier-coller sans adaptation
- ❌ Oublier les tests
- ❌ Ne pas documenter les nouveaux patterns