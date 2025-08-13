# Diagrama de Classes do Plugin AGUIA - Componentes de Acessibilidade

## Introdução

Este documento apresenta o diagrama de classes para os principais componentes do plugin AGUIA de Acessibilidade, com foco especial no subsistema de tradução em Língua Brasileira de Sinais (LIBRAS). O diagrama ilustra as relações entre as classes que compõem o sistema, destacando os atributos com suas respectivas visibilidades e tipos, além das multiplicidades nos relacionamentos.

```mermaid
classDiagram
    class AccessibilityManager {
        -isInitialized : boolean
        -features : FeatureController[]
        -mainButton : DOMElement
    }

    class FeatureController {
        <<Abstract>>
        -featureId : string
        -isEnabled : boolean
        -displayName : string
        -iconSvg : string
    }

    class VLibrasController {
        -enabled : boolean
        -widget : VLibrasWidget
        -apiVersion : string
        -supportedCharacters : string[]
    }
    
    class UIController {
        -menuId : string
        -menuVisible : boolean
        -menuItems : MenuItem[]
        -accessibilityButton : DOMElement
    }

    class MenuItem {
        -id : string
        -text : string
        -iconSvg : string
        -active : boolean
        -ariaLabel : string
    }

    class UserPreferenceManager {
        -storedPreferences : Object
        -useLocalStorage : boolean
        -useServerStorage : boolean
        -userId : string
    }

    class VLibrasWidget {
        -rootPath : string
        -personalization : boolean
        -showMessageBox : boolean
        -showWelcome : boolean
        -characterId : string
    }

    class StyleManager {
        -loadedStylesheets : string[]
        -themeColors : Object
        -darkModeEnabled : boolean
    }

    %% Relacionamentos com multiplicidade
    AccessibilityManager "1" *-- "1..*" FeatureController : contém
    FeatureController <|-- VLibrasController : herança
    VLibrasController "1" --> "1" VLibrasWidget : controla
    AccessibilityManager "1" --> "1" UIController : gerencia
    UIController "1" *-- "1..*" MenuItem : contém
    AccessibilityManager "1" --> "1" UserPreferenceManager : utiliza
    AccessibilityManager "1" --> "1" StyleManager : aplica estilos
    UIController "1" --> "0..1" StyleManager : gerencia aparência
```