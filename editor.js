// Global variables
let editor;
let coreHooks = [];
let pluginHooks = [];
let currentFile = 'main.cs';

// Templates for different plugin types
const templates = {
    basic: `using Oxide.Core;
using Oxide.Core.Plugins;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("MyBasicPlugin", "YourName", "1.0.0")]
    [Description("A basic Rust plugin template")]
    public class MyBasicPlugin : RustPlugin
    {
        #region Hooks
        
        void Init()
        {
            Puts("MyBasicPlugin has been loaded!");
        }
        
        void Unload()
        {
            Puts("MyBasicPlugin has been unloaded!");
        }
        
        void OnPlayerConnected(BasePlayer player)
        {
            PrintToChat($"Welcome {player.displayName}!");
        }
        
        #endregion
        
        #region Commands
        
        [ChatCommand("hello")]
        void HelloCommand(BasePlayer player, string command, string[] args)
        {
            SendReply(player, "Hello! This is my basic plugin.");
        }
        
        #endregion
    }
}`,

    advanced: `using Oxide.Core;
using Oxide.Core.Configuration;
using Oxide.Core.Plugins;
using Oxide.Game.Rust.Cui;
using System.Collections.Generic;
using UnityEngine;

namespace Oxide.Plugins
{
    [Info("MyAdvancedPlugin", "YourName", "1.0.0")]
    [Description("An advanced Rust plugin with configuration and GUI")]
    public class MyAdvancedPlugin : RustPlugin
    {
        #region Configuration
        
        private Configuration config;
        
        public class Configuration
        {
            public bool EnableWelcomeMessage { get; set; } = true;
            public string WelcomeText { get; set; } = "Welcome to the server!";
            public float MessageDuration { get; set; } = 5.0f;
            public Dictionary<string, object> Commands { get; set; } = new Dictionary<string, object>();
        }
        
        protected override void LoadConfig()
        {
            base.LoadConfig();
            config = Config.ReadObject<Configuration>();
            SaveConfig();
        }
        
        protected override void LoadDefaultConfig()
        {
            config = new Configuration();
            SaveConfig();
        }
        
        protected override void SaveConfig()
        {
            Config.WriteObject(config);
        }
        
        #endregion
        
        #region Hooks
        
        void Init()
        {
            LoadConfig();
            Puts("MyAdvancedPlugin has been loaded with configuration!");
        }
        
        void OnPlayerConnected(BasePlayer player)
        {
            if (config.EnableWelcomeMessage)
            {
                timer.Once(1f, () => {
                    ShowWelcomeUI(player);
                });
            }
        }
        
        void OnPlayerDisconnected(BasePlayer player, string reason)
        {
            DestroyUI(player);
        }
        
        #endregion
        
        #region UI
        
        void ShowWelcomeUI(BasePlayer player)
        {
            var elements = new CuiElementContainer();
            
            var panel = elements.Add(new CuiPanel
            {
                Image = { Color = "0 0 0 0.8" },
                RectTransform = { AnchorMin = "0.3 0.7", AnchorMax = "0.7 0.9" }
            }, "Overlay", "WelcomePanel");
            
            elements.Add(new CuiLabel
            {
                Text = { Text = config.WelcomeText, FontSize = 18, Align = TextAnchor.MiddleCenter, Color = "1 1 1 1" },
                RectTransform = { AnchorMin = "0 0", AnchorMax = "1 1" }
            }, panel);
            
            CuiHelper.AddUi(player, elements);
            
            timer.Once(config.MessageDuration, () => DestroyUI(player));
        }
        
        void DestroyUI(BasePlayer player)
        {
            CuiHelper.DestroyUi(player, "WelcomePanel");
        }
        
        #endregion
        
        #region Commands
        
        [ChatCommand("info")]
        void InfoCommand(BasePlayer player, string command, string[] args)
        {
            SendReply(player, $"Server Info:\\nPlayers: {BasePlayer.activePlayerList.Count}\\nPlugin: {Title} v{Version}");
        }
        
        [ConsoleCommand("myplugin.reload")]
        void ReloadCommand(ConsoleSystem.Arg arg)
        {
            if (arg.Player() != null && !arg.Player().IsAdmin) return;
            
            LoadConfig();
            arg.ReplyWith("Configuration reloaded!");
        }
        
        #endregion
    }
}`,

    oxide: `using Oxide.Core;
using Oxide.Core.Libraries.Covalence;
using Oxide.Core.Plugins;
using System.Collections.Generic;

namespace Oxide.Plugins
{
    [Info("MyOxidePlugin", "YourName", "1.0.0")]
    [Description("A plugin template using Oxide framework features")]
    public class MyOxidePlugin : CovalencePlugin
    {
        #region Oxide Dependencies
        
        [PluginReference] private Plugin Economics, ServerRewards;
        
        #endregion
        
        #region Configuration & Data
        
        private PluginConfig config;
        private StoredData storedData;
        
        private class PluginConfig
        {
            public bool UseEconomics { get; set; } = false;
            public double RewardAmount { get; set; } = 100.0;
            public List<string> AllowedCommands { get; set; } = new List<string> { "help", "info" };
        }
        
        private class StoredData
        {
            public Dictionary<string, PlayerData> Players { get; set; } = new Dictionary<string, PlayerData>();
        }
        
        private class PlayerData
        {
            public string Name { get; set; }
            public int TimesJoined { get; set; } = 0;
            public long LastSeen { get; set; }
        }
        
        #endregion
        
        #region Hooks
        
        void Init()
        {
            LoadConfigValues();
            LoadData();
            
            permission.RegisterPermission("myoxideplugin.use", this);
            permission.RegisterPermission("myoxideplugin.admin", this);
        }
        
        void OnUserConnected(IPlayer player)
        {
            var playerData = GetPlayerData(player.Id);
            playerData.Name = player.Name;
            playerData.TimesJoined++;
            playerData.LastSeen = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            
            SaveData();
            
            if (config.UseEconomics && Economics != null)
            {
                Economics.Call("Deposit", player.Id, config.RewardAmount);
                player.Message($"You received {config.RewardAmount} coins for joining!");
            }
        }
        
        object OnUserCommand(IPlayer player, string command, string[] args)
        {
            if (!permission.UserHasPermission(player.Id, "myoxideplugin.use"))
                return null;
                
            if (config.AllowedCommands.Contains(command.ToLower()))
            {
                LogToFile("commands", $"{player.Name} ({player.Id}) used command: {command}", this);
            }
            
            return null;
        }
        
        #endregion
        
        #region Commands
        
        [Command("myplugin")]
        void MyPluginCommand(IPlayer player, string command, string[] args)
        {
            if (args.Length == 0)
            {
                player.Reply("Available commands: stats, reload");
                return;
            }
            
            switch (args[0].ToLower())
            {
                case "stats":
                    ShowPlayerStats(player);
                    break;
                    
                case "reload":
                    if (permission.UserHasPermission(player.Id, "myoxideplugin.admin"))
                    {
                        LoadConfigValues();
                        player.Reply("Configuration reloaded!");
                    }
                    else
                    {
                        player.Reply("You don't have permission to use this command.");
                    }
                    break;
                    
                default:
                    player.Reply("Unknown command. Use 'myplugin' for help.");
                    break;
            }
        }
        
        #endregion
        
        #region Helper Methods
        
        private PlayerData GetPlayerData(string playerId)
        {
            if (!storedData.Players.ContainsKey(playerId))
                storedData.Players[playerId] = new PlayerData();
                
            return storedData.Players[playerId];
        }
        
        private void ShowPlayerStats(IPlayer player)
        {
            var playerData = GetPlayerData(player.Id);
            player.Reply($"Your Stats:\\nTimes Joined: {playerData.TimesJoined}\\nLast Seen: {System.DateTimeOffset.FromUnixTimeSeconds(playerData.LastSeen)}");
        }
        
        #endregion
        
        #region Configuration
        
        protected override void LoadDefaultConfig()
        {
            config = new PluginConfig();
            SaveConfig();
        }
        
        private void LoadConfigValues()
        {
            config = Config.ReadObject<PluginConfig>();
            SaveConfig();
        }
        
        protected override void SaveConfig()
        {
            Config.WriteObject(config, true);
        }
        
        #endregion
        
        #region Data Management
        
        private void LoadData()
        {
            storedData = Interface.Oxide.DataFileSystem.ReadObject<StoredData>(Name);
        }
        
        private void SaveData()
        {
            Interface.Oxide.DataFileSystem.WriteObject(Name, storedData);
        }
        
        #endregion
    }
}`
};

// Initialize the editor when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    loadHooks();
    setupEventListeners();
});

// Initialize Monaco Editor
function initializeEditor() {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }});
    
    require(['vs/editor/editor.main'], function() {
        // Define C# language configuration
        monaco.languages.setLanguageConfiguration('csharp', {
            brackets: [
                ['{', '}'],
                ['[', ']'],
                ['(', ')']
            ],
            autoClosingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ],
            surroundingPairs: [
                { open: '{', close: '}' },
                { open: '[', close: ']' },
                { open: '(', close: ')' },
                { open: '"', close: '"' },
                { open: "'", close: "'" }
            ]
        });

        // Create the editor
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: templates.basic,
            language: 'csharp',
            theme: 'vs-dark',
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            minimap: { enabled: true },
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            wordBasedSuggestions: true
        });

        // Register autocomplete provider
        monaco.languages.registerCompletionItemProvider('csharp', {
            provideCompletionItems: function(model, position) {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const suggestions = [];
                
                // Add hook suggestions
                [...coreHooks, ...pluginHooks].forEach(hook => {
                    const hookName = extractHookName(hook.HookSignature || hook.hookSignature);
                    if (hookName && hookName.toLowerCase().includes(word.word.toLowerCase())) {
                        suggestions.push({
                            label: hookName,
                            kind: monaco.languages.CompletionItemKind.Method,
                            insertText: generateHookCode(hook),
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: {
                                value: `**${hookName}**\n\n${hook.HookSignature || hook.hookSignature}\n\n${hook.pluginName ? `Plugin: ${hook.pluginName}` : 'Core Hook'}`
                            },
                            range: range
                        });
                    }
                });

                // Add common C# keywords and Oxide-specific completions
                const oxideCompletions = [
                    { label: 'BasePlayer', kind: monaco.languages.CompletionItemKind.Class },
                    { label: 'RustPlugin', kind: monaco.languages.CompletionItemKind.Class },
                    { label: 'CovalencePlugin', kind: monaco.languages.CompletionItemKind.Class },
                    { label: 'PrintToChat', kind: monaco.languages.CompletionItemKind.Method },
                    { label: 'SendReply', kind: monaco.languages.CompletionItemKind.Method },
                    { label: 'NextTick', kind: monaco.languages.CompletionItemKind.Method },
                    { label: 'timer.Once', kind: monaco.languages.CompletionItemKind.Method },
                    { label: 'permission.UserHasPermission', kind: monaco.languages.CompletionItemKind.Method },
                    { label: 'Interface.CallHook', kind: monaco.languages.CompletionItemKind.Method }
                ];

                oxideCompletions.forEach(completion => {
                    if (completion.label.toLowerCase().includes(word.word.toLowerCase())) {
                        suggestions.push({
                            ...completion,
                            insertText: completion.label,
                            range: range
                        });
                    }
                });

                return { suggestions: suggestions };
            }
        });

        // Handle trigger character autocomplete (like "On")
        editor.onDidChangeModelContent((e) => {
            const model = editor.getModel();
            const position = editor.getPosition();
            const lineContent = model.getLineContent(position.lineNumber);
            const wordUntilPosition = model.getWordUntilPosition(position);
            
            if (wordUntilPosition.word.toLowerCase().startsWith('on') && wordUntilPosition.word.length >= 2) {
                // Trigger autocomplete for hooks starting with "On"
                editor.trigger('', 'editor.action.triggerSuggest', {});
            }
        });
    });
}

// Load hooks from JSON files
async function loadHooks() {
    try {
        // Load core hooks
        const coreResponse = await fetch('./hooks.json');
        coreHooks = await coreResponse.json();
        populateHooksList(coreHooks, 'coreHooksList', 'core');
        
        // Load plugin hooks
        const pluginResponse = await fetch('./hooksPlugin.json');
        pluginHooks = await pluginResponse.json();
        populateHooksList(pluginHooks, 'pluginHooksList', 'plugin');
        
        console.log(`Loaded ${coreHooks.length} core hooks and ${pluginHooks.length} plugin hooks`);
    } catch (error) {
        console.error('Error loading hooks:', error);
    }
}

// Populate hooks list in the sidebar
function populateHooksList(hooks, containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    hooks.forEach(hook => {
        const hookItem = document.createElement('div');
        hookItem.className = 'hook-item';
        
        const hookName = extractHookName(hook.HookSignature || hook.hookSignature);
        const signature = hook.HookSignature || hook.hookSignature;
        const pluginName = hook.pluginName || 'Core';
        
        hookItem.innerHTML = `
            <div class="hook-name">${hookName}</div>
            <div class="hook-signature">${signature}</div>
            <div class="plugin-name">${pluginName}</div>
        `;
        
        hookItem.addEventListener('click', () => {
            insertHookIntoEditor(hook);
        });
        
        container.appendChild(hookItem);
    });
}

// Extract hook name from signature
function extractHookName(signature) {
    if (!signature) return '';
    const match = signature.match(/^(\w+)/);
    return match ? match[1] : signature;
}

// Generate hook code for insertion
function generateHookCode(hook) {
    const hookName = extractHookName(hook.HookSignature || hook.hookSignature);
    const signature = hook.HookSignature || hook.hookSignature;
    
    // Parse parameters from signature
    const paramMatch = signature.match(/\((.*?)\)/);
    const params = paramMatch ? paramMatch[1] : '';
    
    // Generate method signature
    let methodCode;
    if (params) {
        methodCode = `${hookName}(${params})\n{\n    \${1:// Your code here}\n}`;
    } else {
        methodCode = `${hookName}()\n{\n    \${1:// Your code here}\n}`;
    }
    
    return methodCode;
}

// Insert hook into editor
function insertHookIntoEditor(hook) {
    if (!editor) return;
    
    const position = editor.getPosition();
    const hookCode = generateHookCode(hook);
    
    editor.executeEdits('', [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: '\n        ' + hookCode.replace(/\n/g, '\n        ') + '\n'
    }]);
    
    editor.focus();
}

// Setup event listeners
function setupEventListeners() {
    // Hook search functionality
    const coreSearch = document.getElementById('coreHooksSearch');
    const pluginSearch = document.getElementById('pluginHooksSearch');
    
    if (coreSearch) {
        coreSearch.addEventListener('input', (e) => {
            filterHooks(coreHooks, 'coreHooksList', e.target.value, 'core');
        });
    }
    
    if (pluginSearch) {
        pluginSearch.addEventListener('input', (e) => {
            filterHooks(pluginHooks, 'pluginHooksList', e.target.value, 'plugin');
        });
    }
    
    // Tab switching
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.file);
        });
    });
}

// Filter hooks based on search
function filterHooks(hooks, containerId, searchTerm, type) {
    const filteredHooks = hooks.filter(hook => {
        const hookName = extractHookName(hook.HookSignature || hook.hookSignature);
        const signature = hook.HookSignature || hook.hookSignature;
        const pluginName = hook.pluginName || '';
        
        return hookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               signature.toLowerCase().includes(searchTerm.toLowerCase()) ||
               pluginName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    populateHooksList(filteredHooks, containerId, type);
}

// Switch between tabs
function switchTab(fileName) {
    currentFile = fileName;
    
    // Update tab active state
    document.querySelectorAll('.editor-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.file === fileName);
    });
    
    // Switch editor content based on file type
    if (fileName.endsWith('.json')) {
        editor.getModel().setLanguage('json');
        if (fileName === 'config.json') {
            editor.setValue(`{
  "WelcomeMessage": "Welcome to the server!",
  "EnableFeature": true,
  "MaxPlayers": 100,
  "Commands": {
    "help": true,
    "info": true
  },
  "Rewards": {
    "JoinReward": 50,
    "DailyReward": 100
  }
}`);
        }
    } else {
        editor.getModel().setLanguage('csharp');
        if (!editor.getValue() || editor.getValue() === '') {
            editor.setValue(templates.basic);
        }
    }
}

// Load template
function loadTemplate(templateName) {
    if (templates[templateName] && editor) {
        editor.setValue(templates[templateName]);
        // Switch to C# if not already
        if (currentFile.endsWith('.json')) {
            switchTab('main.cs');
        }
    }
}

// Format code
function formatCode() {
    if (editor) {
        editor.trigger('', 'editor.action.formatDocument');
    }
}

// Validate code
function validateCode() {
    if (!editor) return;
    
    const code = editor.getValue();
    const errors = [];
    
    // Basic validation checks
    if (!code.includes('namespace Oxide.Plugins')) {
        errors.push('Missing Oxide.Plugins namespace');
    }
    
    if (!code.includes('public class') || !code.includes(': RustPlugin')) {
        errors.push('Plugin class should extend RustPlugin or CovalencePlugin');
    }
    
    if (!code.includes('[Info(')) {
        errors.push('Missing [Info] attribute');
    }
    
    // Check for common syntax issues
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
        errors.push('Mismatched braces');
    }
    
    // Display results
    if (errors.length === 0) {
        showNotification('Code validation passed!', 'success');
    } else {
        showNotification(`Validation errors: ${errors.join(', ')}`, 'error');
    }
}

// Save code to localStorage
function saveCode() {
    if (!editor) return;
    
    const code = editor.getValue();
    localStorage.setItem(`rustplugin_${currentFile}`, code);
    showNotification('Code saved locally', 'success');
}

// Download plugin
function downloadPlugin() {
    if (!editor) return;
    
    const code = editor.getValue();
    const fileName = currentFile.endsWith('.cs') ? currentFile : 'plugin.cs';
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Plugin downloaded!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to container
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Load saved code on page load
window.addEventListener('load', () => {
    const savedCode = localStorage.getItem(`rustplugin_${currentFile}`);
    if (savedCode && editor) {
        editor.setValue(savedCode);
    }
});