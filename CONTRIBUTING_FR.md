# Comment contribuer

Cette librairie est l’un des projets open source de la Ville de Montréal. Elle est utilisé pour les services en ligne que vous pouvez accéder à [beta.montreal.com](https://beta.montreal.com).

## [Code de conduite](http://ville.montreal.qc.ca/pls/portal/docs/page/intra_fr/media/documents/code_conduite_employes.pdf)

Les participants aux projets doivent souscrire au code de conduite que la Ville de Montréal a adopté. Veuillez lire [le texte intégral](http://ville.montreal.qc.ca/pls/portal/docs/page/intra_fr/media/documents/code_conduite_employes.pdf) afin de comprendre quelles actions seront ou ne seront pas tolérées.

## Développement ouvert

Tous les travaux sur cette librairie se font directement sur [GitHub] (/). Les membres de l'équipe principale et les contributeurs externes envoient des demandes "Pull request" qui passent par le même processus de révision.

### `master` est dangereux

Nous ferons de notre mieux pour garder la branche `master` en bonne forme, avec des tests. Mais pour aller vite, nous allons faire des changements d’API. Ces changements pourraient ne pas être compatible avec votre application. Nous ferons de notre mieux pour communiquer ces modifications et toujours disposer de la version appropriée afin que vous puissiez verrouiller une version spécifique si besoin est.

### Github

Ma PR traite les demandes suivantes de Github et les référence dans le titre de ma PR. Par exemple, "feat(scope): #XXX My PR"
Si vous corrigez une faute de frappe dans la documentation, vous pouvez l'ajouter à votre commit avec docs(scope): xxxx #XXX. Les modifications de code nécessitent toujours une demande Github.

#### La description
  
Voici quelques détails sur ma PR, y compris des captures d'écran de toutes les modifications apportées à l'interface utilisateur:

-   Clarifiez la documentation.
-   Pas de changements d'interface utilisateur.

#### Tests

Ma PR ajoute les tests unitaires suivants OU n'a pas besoin de test pour cette très bonne raison:

-   Ce n'est qu'un simple changement de documentation.

#### Commits
  Mon commit référence dans le sujet la demande Github (recommandé),
  et j'ai **écrasé** plusieurs commits s'ils traitent la même chose.
  De plus, mes commits suivent les instructions de ["Comment rédiger un bon message de validation git"](https://www.conventionalcommits.org/fr/v1.0.0-beta.3)

#### Documentation
  En cas de nouvelle fonctionnalité, ma PR ajoute une documentation décrivant son utilisation.

## Certificat d'origine du développeur (DCO)
Pour accepter vos demandes, nous devons vous soumettre un DCO. Il vous suffit d'ajouter l'option de ligne de commande `-s` pour l'ajouter automatiquement à votre message de validation.
[Plus de détails](https://github.com/probot/dco)
