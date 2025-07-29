# Rust Plugin Code Editor Workspace

A modern, feature-rich code editor workspace specifically designed for developing C# plugins for Rust using the Oxide/Carbon framework. This editor provides intelligent autocomplete, hook assistance, and templates to streamline your Rust plugin development.

## Features

### 🚀 **Advanced Code Editor**
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting, IntelliSense, and error detection
- **C# Language Support**: Complete C# syntax support with auto-completion and code validation
- **Dark Theme**: Modern dark theme optimized for long coding sessions
- **Multiple File Support**: Switch between C# plugin files and JSON configuration files

### 🎯 **Intelligent Autocomplete**
- **Hook Autocomplete**: Automatic suggestions for all available Rust/Oxide hooks
- **Parameter Assistance**: Shows correct parameter types and signatures for hooks
- **Plugin-Specific Hooks**: Access to hooks from popular plugins like Friends, Kits, Economics, etc.
- **Trigger-Based Suggestions**: Start typing "On" to see all available event hooks

### 📚 **Hook Database**
- **5500+ Core Hooks**: Complete database of Rust core hooks with signatures
- **350+ Plugin Hooks**: Extended hooks from popular community plugins
- **Searchable Interface**: Quickly find hooks by name, signature, or plugin
- **Click-to-Insert**: Click any hook in the sidebar to insert it into your code

### 🔧 **Built-in Templates**
- **Basic Plugin Template**: Simple plugin structure for beginners
- **Advanced Plugin Template**: Full-featured plugin with configuration, UI, and commands
- **Oxide Framework Template**: Covalence plugin with cross-platform support

### 💾 **Development Tools**
- **Code Formatting**: Automatic code formatting and indentation
- **Validation**: Real-time code validation and error checking
- **Local Storage**: Automatically saves your work locally
- **Plugin Download**: Export your finished plugin as a .cs file

## Getting Started

### Setup Instructions

1. **Clone or Download** this workspace to your local machine
2. **Open `index.html`** in a modern web browser (Chrome, Firefox, Edge, Safari)
3. **Start Coding**: The editor will load with a basic plugin template

### File Structure

```
workspace/
├── index.html          # Main editor interface
├── editor.js           # Editor functionality and autocomplete
├── styles_v10.css      # Modern UI styling
├── hooks.json          # Rust core hooks database (5500+ hooks)
├── hooksPlugin.json    # Plugin hooks database (350+ hooks)
└── README.md           # This documentation
```

## How to Use

### 1. **Basic Plugin Development**

1. Click "Basic Plugin" template to start with a simple structure
2. Modify the plugin name, version, and author in the `[Info]` attribute
3. Add your hooks in the `#region Hooks` section
4. Add commands in the `#region Commands` section

### 2. **Using Autocomplete**

- **Type "On"** to see all available event hooks
- **Search hooks** using the sidebar search boxes
- **Click hooks** in the sidebar to insert them automatically
- **Use Ctrl+Space** to trigger manual autocomplete

### 3. **Hook Categories**

#### **Core Hooks** (Rust Engine)
- Player events: `OnPlayerConnected`, `OnPlayerDisconnected`, `OnPlayerChat`
- Entity events: `OnEntityTakeDamage`, `OnEntitySpawned`, `OnEntityKill`
- Server events: `OnServerInitialized`, `OnServerShutdown`
- And 5000+ more...

#### **Plugin Hooks** (Community Plugins)
- **Friends**: `IsFriend`, `AddFriend`, `RemoveFriend`
- **Economics**: `Withdraw`, `Deposit`, `GetBalance`
- **Kits**: `GiveKit`, `HasKit`, `GetKitCooldown`
- **And many more from 50+ popular plugins**

### 4. **Templates Overview**

#### **Basic Template**
- Simple plugin structure
- Basic hooks and commands
- Perfect for learning

#### **Advanced Template**
- Configuration system
- GUI elements using CUI
- Timer management
- Data persistence

#### **Oxide Template**
- Cross-platform Covalence support
- Plugin dependencies
- Permission system
- Data storage

### 5. **Code Validation**

The editor includes basic validation for:
- Required namespace (`Oxide.Plugins`)
- Plugin class inheritance (`RustPlugin` or `CovalencePlugin`)
- Info attribute presence
- Syntax errors (mismatched braces)

## Plugin Development Best Practices

### 1. **Plugin Structure**
```csharp
namespace Oxide.Plugins
{
    [Info("PluginName", "YourName", "1.0.0")]
    [Description("Plugin description")]
    public class PluginName : RustPlugin
    {
        #region Configuration
        // Config classes and methods
        #endregion
        
        #region Hooks
        // Event hooks
        #endregion
        
        #region Commands
        // Chat and console commands
        #endregion
        
        #region Helper Methods
        // Utility methods
        #endregion
    }
}
```

### 2. **Common Hooks**
- `Init()` - Plugin initialization
- `Unload()` - Plugin cleanup
- `OnPlayerConnected()` - Player joins server
- `OnPlayerDisconnected()` - Player leaves server
- `OnPlayerChat()` - Player sends chat message

### 3. **Configuration Example**
```csharp
private class Configuration
{
    public string WelcomeMessage { get; set; } = "Welcome!";
    public bool EnableFeature { get; set; } = true;
    public float Cooldown { get; set; } = 60f;
}
```

### 4. **Commands Example**
```csharp
[ChatCommand("hello")]
void HelloCommand(BasePlayer player, string command, string[] args)
{
    SendReply(player, "Hello!");
}

[ConsoleCommand("myplugin.reload")]
void ReloadCommand(ConsoleSystem.Arg arg)
{
    // Reload logic
}
```

## Available Hooks by Category

### **Player Events**
- `OnPlayerConnected(BasePlayer player)`
- `OnPlayerDisconnected(BasePlayer player, string reason)`
- `OnPlayerChat(BasePlayer player, string message)`
- `OnPlayerRespawned(BasePlayer player)`
- `OnPlayerDeath(BasePlayer player, HitInfo info)`

### **Entity Events**
- `OnEntityTakeDamage(BaseCombatEntity entity, HitInfo info)`
- `OnEntitySpawned(BaseNetworkable entity)`
- `OnEntityBuilt(Planner planner, GameObject gameObject)`
- `OnEntityKill(BaseNetworkable entity)`

### **Item Events**
- `OnItemCraft(ItemCraftTask task, BasePlayer crafter)`
- `OnItemPickup(Item item, BasePlayer player)`
- `OnItemDrop(Item item, BasePlayer player)`

### **Server Events**
- `OnServerInitialized()`
- `OnServerShutdown()`
- `OnNewSave(string filename)`

### **Plugin Integration**
- **Economics**: Balance management, transactions
- **Friends**: Friend system integration
- **Clans**: Clan system support
- **Kits**: Kit system integration
- **And many more...**

## Troubleshooting

### Common Issues

1. **Hooks not loading**: Ensure `hooks.json` and `hooksPlugin.json` are in the same directory
2. **Autocomplete not working**: Try refreshing the page or pressing Ctrl+Space
3. **Code not saving**: Check browser local storage permissions

### Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+

## Development Tips

1. **Use the search function** to quickly find specific hooks
2. **Start with templates** to understand proper plugin structure
3. **Test frequently** using the validation feature
4. **Save regularly** - the editor auto-saves to browser storage
5. **Use regions** to organize your code (`#region Name`)

## Contributing

This workspace uses the following hook databases:
- `hooks.json`: Contains 5500+ Rust core hooks with signatures and source code
- `hooksPlugin.json`: Contains 350+ community plugin hooks

To contribute additional hooks or improve the editor, please ensure compatibility with the existing JSON structure.

## License

This code editor workspace is provided as-is for Rust plugin development. The hook databases are compiled from public Oxide/uMod documentation and plugin sources.

---

**Happy Plugin Development! 🦀**

For questions, issues, or contributions, please refer to the Oxide/uMod community forums and documentation.