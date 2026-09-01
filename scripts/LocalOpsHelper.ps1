[CmdletBinding()]
param(
  [switch]$InstallShortcut
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

$apiBase = 'https://apex-citadel-api.mr-jwswain.workers.dev'
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop '3000 Studios Helper.lnk'
$scriptPath = $MyInvocation.MyCommand.Path

function New-Shortcut {
  param([string]$TargetPath, [string]$Arguments, [string]$Description)
  $shell = New-Object -ComObject WScript.Shell
  $link = $shell.CreateShortcut($shortcutPath)
  $link.TargetPath = $TargetPath
  $link.Arguments = $Arguments
  $link.WorkingDirectory = Split-Path $scriptPath
  $link.Description = $Description
  $link.Save()
}

if ($InstallShortcut) {
  New-Shortcut -TargetPath (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe') -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Description '3000 Studios Helper'
  Write-Host "Shortcut created at $shortcutPath"
  return
}

function Invoke-Json {
  param([string]$Path, [string]$Method = 'GET', [object]$Body = $null)
  $params = @{
    Uri = "$apiBase$Path"
    Method = $Method
    ContentType = 'application/json'
    TimeoutSec = 30
  }
  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 8)
  }
  Invoke-RestMethod @params
}

function Get-SystemSnapshot {
  $defender = Get-MpComputerStatus
  $firewall = Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
  $dns = Get-DnsClientServerAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, ServerAddresses
  $listeners = Get-NetTCPConnection -State Listen | ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [pscustomobject]@{
      Port = $_.LocalPort
      Process = $proc.ProcessName
      Path = $proc.Path
    }
  } | Sort-Object Port
  $top = Get-Process | Select-Object Id, ProcessName, Path, @{
    Name = 'CPUSeconds'
    Expression = {
      if ($null -eq $_.CPU) { 0 }
      elseif ($_.CPU -is [TimeSpan]) { [math]::Round($_.CPU.TotalSeconds, 1) }
      else { [math]::Round([double]$_.CPU, 1) }
    }
  } | Sort-Object CPUSeconds -Descending | Select-Object -First 15

  [pscustomobject]@{
    Defender = [pscustomobject]@{
      AntivirusEnabled = $defender.AntivirusEnabled
      RealTimeProtectionEnabled = $defender.RealTimeProtectionEnabled
      TamperProtected = $defender.IsTamperProtected
      QuickScanAge = $defender.QuickScanAge
      FullScanAge = $defender.FullScanAge
      SignatureUpdated = $defender.AntivirusSignatureLastUpdated
    }
    Firewall = $firewall
    DNS = $dns
    Listeners = $listeners
    TopProcesses = $top
  }
}

function Get-ImportantProcesses {
  $names = @(
    'System','System Idle Process','csrss','wininit','services','lsass','smss','svchost',
    'dwm','explorer','SearchHost','StartMenuExperienceHost','ShellExperienceHost',
    'RuntimeBroker','fontdrvhost','spoolsv','WmiPrvSE','SecurityHealthSystray',
    'ShellHost','OneDrive','Secure System','audiodg','WlanSvc','nvvsvc','NVDisplay.Container',
    'mspmsnsv','MsMpEng','WinDefend','Taskmgr','chrome','msedge','firefox'
  )
  Get-Process | Where-Object { $names -contains $_.ProcessName } | Select-Object Id, ProcessName, Path, @{
    Name = 'CPUSeconds'
    Expression = {
      if ($null -eq $_.CPU) { 0 }
      elseif ($_.CPU -is [TimeSpan]) { [math]::Round($_.CPU.TotalSeconds, 1) }
      else { [math]::Round([double]$_.CPU, 1) }
    }
  } | Sort-Object ProcessName
}

function Get-PortfolioSites {
  try {
    (Invoke-Json -Path '/ops/sites/overview').overview
  } catch {
    @()
  }
}

function Format-AdSenseAdvice {
  param($site)
  $notes = New-Object System.Collections.Generic.List[string]
  if (-not $site.monetization.adsenseClientId) { $notes.Add('Add a real AdSense client ID.') }
  if (-not $site.monetization.adsenseEnabled) { $notes.Add('Enable AdSense in site settings only after the account is approved.') }
  if ($site.monetization.adsense.state -eq 'missing') { $notes.Add('Add AdSense script/slots to the page template.') }
  elseif ($site.monetization.adsense.state -eq 'issue') { $notes.Add('Fix script/slot mismatch and re-run bridge inspection.') }
  elseif ($site.monetization.adsense.state -eq 'configured') { $notes.Add('Waiting on page detection and approval checks.') }
  if ($notes.Count -eq 0) { $notes.Add('No obvious AdSense blockers from the cached check.') }
  $notes -join ' '
}

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="3000 Studios Helper" Height="920" Width="1400"
        WindowStartupLocation="CenterScreen" Background="#10141c" Foreground="#f3f7ff">
  <Window.Resources>
    <Style TargetType="Button">
      <Setter Property="Background" Value="#263247"/>
      <Setter Property="Foreground" Value="#f3f7ff"/>
      <Setter Property="BorderBrush" Value="#3c4d6a"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="Padding" Value="14,8"/>
      <Setter Property="Margin" Value="0,0,0,0"/>
      <Setter Property="Cursor" Value="Hand"/>
      <Setter Property="RenderTransformOrigin" Value="0.5,0.5"/>
      <Setter Property="Template">
        <Setter.Value>
          <ControlTemplate TargetType="Button">
            <Border x:Name="Root" Background="{TemplateBinding Background}" BorderBrush="{TemplateBinding BorderBrush}" BorderThickness="{TemplateBinding BorderThickness}" CornerRadius="10">
              <Grid>
                <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
              </Grid>
            </Border>
            <ControlTemplate.Triggers>
              <Trigger Property="IsMouseOver" Value="True">
                <Setter TargetName="Root" Property="Background" Value="#31415c"/>
              </Trigger>
              <Trigger Property="IsPressed" Value="True">
                <Setter TargetName="Root" Property="Background" Value="#1d7dff"/>
                <Setter TargetName="Root" Property="RenderTransform">
                  <Setter.Value>
                    <ScaleTransform ScaleX="0.97" ScaleY="0.97"/>
                  </Setter.Value>
                </Setter>
              </Trigger>
              <Trigger Property="IsEnabled" Value="False">
                <Setter TargetName="Root" Property="Opacity" Value="0.55"/>
              </Trigger>
            </ControlTemplate.Triggers>
          </ControlTemplate>
        </Setter.Value>
      </Setter>
    </Style>
    <Style x:Key="CardBorder" TargetType="Border">
      <Setter Property="Background" Value="#151b25"/>
      <Setter Property="BorderBrush" Value="#263247"/>
      <Setter Property="BorderThickness" Value="1"/>
      <Setter Property="CornerRadius" Value="14"/>
      <Setter Property="Padding" Value="12"/>
      <Setter Property="SnapsToDevicePixels" Value="True"/>
    </Style>
  </Window.Resources>
  <Window.Triggers>
    <EventTrigger RoutedEvent="Window.Loaded">
      <BeginStoryboard>
        <Storyboard>
          <DoubleAnimation Storyboard.TargetProperty="Opacity" From="0" To="1" Duration="0:0:0.25"/>
        </Storyboard>
      </BeginStoryboard>
    </EventTrigger>
  </Window.Triggers>
  <Grid Margin="16">
    <Grid.RowDefinitions>
      <RowDefinition Height="Auto"/>
      <RowDefinition Height="Auto"/>
      <RowDefinition Height="Auto"/>
      <RowDefinition Height="*"/>
      <RowDefinition Height="220"/>
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
      <ColumnDefinition Width="1.1*"/>
      <ColumnDefinition Width="0.9*"/>
    </Grid.ColumnDefinitions>

    <Grid Grid.Row="0" Grid.ColumnSpan="2" Margin="0,0,0,12">
      <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="Auto"/>
      </Grid.ColumnDefinitions>
      <StackPanel>
        <TextBlock Text="3000 Studios Helper" FontSize="28" FontWeight="Bold"/>
        <TextBlock Text="System scan, network, firewall, running apps, and live site/AdSense checks" Foreground="#9ab0cf"/>
      </StackPanel>
      <StackPanel Grid.Column="1" Orientation="Horizontal" HorizontalAlignment="Right">
        <Button x:Name="ScanButton" Content="Run Full Scan" Margin="8,0,0,0" Padding="14,8"/>
        <Button x:Name="RefreshButton" Content="Refresh Apps" Margin="8,0,0,0" Padding="14,8"/>
        <Button x:Name="SiteButton" Content="Check Sites" Margin="8,0,0,0" Padding="14,8"/>
      </StackPanel>
    </Grid>

    <Border Grid.Row="1" Grid.ColumnSpan="2" Style="{StaticResource CardBorder}">
      <WrapPanel>
        <TextBlock x:Name="DefenderText" Margin="0,0,18,0"/>
        <TextBlock x:Name="FirewallText" Margin="0,0,18,0"/>
        <TextBlock x:Name="DnsText" Margin="0,0,18,0"/>
        <TextBlock x:Name="ScanText" Margin="0,0,18,0"/>
      </WrapPanel>
    </Border>

    <Border Grid.Row="2" Grid.ColumnSpan="2" Margin="0,12,0,0" Style="{StaticResource CardBorder}" Background="#121823">
      <Grid>
        <Grid.ColumnDefinitions>
          <ColumnDefinition Width="*"/>
          <ColumnDefinition Width="Auto"/>
        </Grid.ColumnDefinitions>
        <StackPanel>
          <TextBlock x:Name="FlowTitle" Text="Idle" FontSize="18" FontWeight="Bold"/>
          <TextBlock x:Name="FlowText" Text="Press a button to start a scan, refresh the app list, or load live site data." Foreground="#9ab0cf" TextWrapping="Wrap"/>
        </StackPanel>
        <StackPanel Grid.Column="1" HorizontalAlignment="Right">
          <ProgressBar x:Name="FlowBar" Width="260" Height="10" Minimum="0" Maximum="100" Value="0" Margin="0,4,0,6"/>
          <TextBlock x:Name="FlowMeta" Text="Ready" HorizontalAlignment="Right" Foreground="#9ab0cf"/>
        </StackPanel>
      </Grid>
    </Border>

    <Grid Grid.Row="3" Grid.ColumnSpan="2" Margin="0,12,0,12">
      <Grid.ColumnDefinitions>
        <ColumnDefinition Width="0.62*"/>
        <ColumnDefinition Width="0.38*"/>
      </Grid.ColumnDefinitions>

      <TabControl Grid.Column="0" Background="#151b25" BorderBrush="#263247" Foreground="#f3f7ff">
        <TabItem Header="Running Apps">
          <Grid Margin="8">
            <Grid.RowDefinitions>
              <RowDefinition Height="Auto"/>
              <RowDefinition Height="*"/>
              <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>
            <TextBlock x:Name="ProcessSummary" Text="Safe rows are core Windows services. Anything else is usually optional." Margin="0,0,0,8"/>
            <DataGrid x:Name="ProcessGrid" Grid.Row="1" AutoGenerateColumns="False" IsReadOnly="True" HeadersVisibility="Column" SelectionMode="Single" Background="#111722" Foreground="#f3f7ff" BorderBrush="#263247">
              <DataGrid.Columns>
                <DataGridTextColumn Header="PID" Binding="{Binding Id}" Width="80"/>
                <DataGridTextColumn Header="Process" Binding="{Binding ProcessName}" Width="180"/>
                <DataGridTextColumn Header="CPU" Binding="{Binding CPUSeconds}" Width="100"/>
                <DataGridTextColumn Header="Path" Binding="{Binding Path}" Width="*"/>
              </DataGrid.Columns>
            </DataGrid>
            <StackPanel Grid.Row="2" Orientation="Horizontal" Margin="0,8,0,0">
              <Button x:Name="KillButton" Content="Kill Selected Process" Padding="14,8"/>
              <Button x:Name="SafeButton" Content="Show Necessary Only" Margin="8,0,0,0" Padding="14,8"/>
              <Button x:Name="AllButton" Content="Show All" Margin="8,0,0,0" Padding="14,8"/>
              <TextBlock x:Name="KillText" Margin="12,0,0,0" VerticalAlignment="Center"/>
            </StackPanel>
          </Grid>
        </TabItem>
        <TabItem Header="System Scan">
          <ScrollViewer Margin="8">
            <TextBox x:Name="SystemBox" Background="#111722" Foreground="#f3f7ff" BorderBrush="#263247" IsReadOnly="True" AcceptsReturn="True" TextWrapping="Wrap" VerticalScrollBarVisibility="Auto" HorizontalScrollBarVisibility="Auto"/>
          </ScrollViewer>
        </TabItem>
        <TabItem Header="Live Sites">
          <Grid Margin="8">
            <Grid.RowDefinitions>
              <RowDefinition Height="Auto"/>
              <RowDefinition Height="*"/>
            </Grid.RowDefinitions>
            <TextBlock Text="Portfolio domains, AdSense readiness, and suggested fixes." Margin="0,0,0,8"/>
            <DataGrid x:Name="SiteGrid" Grid.Row="1" AutoGenerateColumns="False" IsReadOnly="True" HeadersVisibility="Column" Background="#111722" Foreground="#f3f7ff" BorderBrush="#263247">
              <DataGrid.Columns>
                <DataGridTextColumn Header="Site" Binding="{Binding site.name}" Width="170"/>
                <DataGridTextColumn Header="URL" Binding="{Binding site.url}" Width="220"/>
                <DataGridTextColumn Header="AdSense" Binding="{Binding monetization.adsense.state}" Width="90"/>
                <DataGridTextColumn Header="Recommendation" Binding="{Binding Recommendation}" Width="*"/>
              </DataGrid.Columns>
            </DataGrid>
          </Grid>
        </TabItem>
      </TabControl>

      <Border Grid.Column="1" Margin="12,0,0,0" Style="{StaticResource CardBorder}">
        <StackPanel>
          <TextBlock Text="Quick Labels" FontSize="18" FontWeight="Bold" Margin="0,0,0,8"/>
          <TextBlock Text="Voice app: WinTranscribe / vibe" Margin="0,0,0,6"/>
          <TextBlock Text="System app: Defender + firewall + network + startup" Margin="0,0,0,6"/>
          <TextBlock Text="Necessary processes: core Windows, Explorer, Defender, OneDrive, audio, network" Margin="0,0,0,6"/>
          <TextBlock Text="Kill only clearly non-essential apps you started." TextWrapping="Wrap" Margin="0,0,0,12"/>
          <Button x:Name="TestBackendButton" Content="Test API / Backend" Padding="14,8"/>
          <Button x:Name="OpenHelperButton" Content="Create Desktop Icon Again" Padding="14,8"/>
          <Button x:Name="OpenVaultButton" Content="Open Web Ops Console" Margin="0,8,0,0" Padding="14,8"/>
        </StackPanel>
      </Border>
    </Grid>

    <Border Grid.Row="4" Grid.ColumnSpan="2" Style="{StaticResource CardBorder}">
      <TextBox x:Name="OutputBox" Background="#111722" Foreground="#f3f7ff" BorderBrush="#263247" IsReadOnly="True" AcceptsReturn="True" TextWrapping="Wrap" VerticalScrollBarVisibility="Auto" HorizontalScrollBarVisibility="Auto"/>
    </Border>
  </Grid>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader ([xml]$xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$ScanButton = $window.FindName('ScanButton')
$RefreshButton = $window.FindName('RefreshButton')
$SiteButton = $window.FindName('SiteButton')
$DefenderText = $window.FindName('DefenderText')
$FirewallText = $window.FindName('FirewallText')
$DnsText = $window.FindName('DnsText')
$ScanText = $window.FindName('ScanText')
$FlowTitle = $window.FindName('FlowTitle')
$FlowText = $window.FindName('FlowText')
$FlowBar = $window.FindName('FlowBar')
$FlowMeta = $window.FindName('FlowMeta')
$ProcessGrid = $window.FindName('ProcessGrid')
$ProcessSummary = $window.FindName('ProcessSummary')
$KillButton = $window.FindName('KillButton')
$SafeButton = $window.FindName('SafeButton')
$AllButton = $window.FindName('AllButton')
$KillText = $window.FindName('KillText')
$SystemBox = $window.FindName('SystemBox')
$SiteGrid = $window.FindName('SiteGrid')
$OutputBox = $window.FindName('OutputBox')
$OpenHelperButton = $window.FindName('OpenHelperButton')
$OpenVaultButton = $window.FindName('OpenVaultButton')
$TestBackendButton = $window.FindName('TestBackendButton')

$necessary = @(
  'System','System Idle Process','csrss','wininit','services','lsass','smss','svchost','dwm',
  'explorer','SearchHost','StartMenuExperienceHost','ShellExperienceHost','RuntimeBroker',
  'fontdrvhost','spoolsv','WmiPrvSE','SecurityHealthSystray','OneDrive','audiodg','MsMpEng','WinDefend',
  'WlanSvc','NVDisplay.Container','RtkAudUService','pia-service','chrome','msedge'
)

function Set-Output([string]$text) { $OutputBox.Text = $text }

function Set-FlowFast {
  param([string]$Title, [string]$Text, [int]$Percent, [string]$Meta)
  Set-Flow -Title $Title -Text $Text -Percent $Percent -Meta $Meta
}

function Set-Flow {
  param(
    [string]$Title,
    [string]$Text,
    [int]$Percent = 0,
    [string]$Meta = 'Ready'
  )
  $window.Dispatcher.Invoke([action]{
    $FlowTitle.Text = $Title
    $FlowText.Text = $Text
    $FlowBar.Value = [math]::Max(0, [math]::Min(100, $Percent))
    $FlowMeta.Text = $Meta
  })
}

function Set-Busy {
  param([bool]$Busy, [string]$Phase = 'Ready', [string]$Detail = 'Ready', [int]$Percent = 0)
  foreach ($button in @($ScanButton, $RefreshButton, $SiteButton, $KillButton, $SafeButton, $OpenHelperButton, $OpenVaultButton)) {
    $button.IsEnabled = -not $Busy
  }
  $window.Cursor = if ($Busy) { [System.Windows.Input.Cursors]::Wait } else { [System.Windows.Input.Cursors]::Arrow }
  if ($Busy) {
    Set-Flow -Title $Phase -Text $Detail -Percent $Percent -Meta 'Working'
  } else {
    Set-Flow -Title 'Idle' -Text 'Press a button to start a scan, refresh the app list, or load live site data.' -Percent 0 -Meta 'Ready'
  }
}

function Refresh-UI {
  Set-FlowFast 'Refreshing local snapshot' 'Reading Defender, firewall, DNS, open ports, and top processes.' 25 'Scanning local machine'
  $snap = Get-SystemSnapshot
  $DefenderText.Text = "Defender: $($snap.Defender.AntivirusEnabled)  RTP: $($snap.Defender.RealTimeProtectionEnabled)  Tamper: $($snap.Defender.TamperProtected)"
  $FirewallText.Text = "Firewall: " + (($snap.Firewall | ForEach-Object { "$($_.Name)=$($_.Enabled)" }) -join '  |  ')
  $DnsText.Text = "DNS: " + (($snap.DNS | ForEach-Object { "$($_.InterfaceAlias): $($_.ServerAddresses -join ', ')" }) -join '  |  ')
  $ScanText.Text = "Quick scan age: $($snap.Defender.QuickScanAge)  Full scan age: $($snap.Defender.FullScanAge)"
  $ProcessGrid.ItemsSource = $snap.TopProcesses
  $SystemBox.Text = ($snap | ConvertTo-Json -Depth 6)
  Set-FlowFast 'Local snapshot ready' 'Security, network, and process data refreshed.' 100 'Ready'
}

function Refresh-Sites {
  Set-FlowFast 'Loading live sites' 'Checking portfolio domains, AdSense status, and recommendations.' 40 'Loading live site data'
  $sites = @((Get-PortfolioSites) | ForEach-Object {
    $state = $_.monetization.adsense.state
    $status = switch ($state) {
      'live' { 'Live' }
      'issue' { 'Needs review' }
      'configured' { 'Configured' }
      default { 'Missing' }
    }
    [pscustomobject]@{
      site = $_.site
      monetization = $_.monetization
      AdSenseStatus = $status
      Recommendation = Format-AdSenseAdvice $_
    }
  })
  $SiteGrid.ItemsSource = $sites
  if ($sites.Count -eq 0) {
    Set-Output "No live portfolio data was returned from the API. Check connectivity or the API base URL."
  } else {
    Set-Output ("Loaded {0} live site records." -f $sites.Count)
  }
  Set-FlowFast 'Live sites ready' ("Loaded {0} live site records." -f $sites.Count) 100 'Ready'
}

Set-Busy -Busy $true -Phase 'Starting helper' -Detail 'Loading system and live site data.' -Percent 10
try {
  Refresh-UI
  Refresh-Sites
} catch {
  Set-Output "Startup load failed: $($_.Exception.Message)"
} finally {
  Set-Busy -Busy $false
}

$RefreshButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Refreshing apps' -Detail 'Checking local running apps and core services.' -Percent 10
  try {
    Refresh-UI
    Set-Output "Refreshed running apps, firewall, Defender, and network snapshot."
  } catch {
    Set-Output "Refresh failed: $($_.Exception.Message)"
  } finally {
    Set-Busy -Busy $false
  }
})

$ScanButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Running full scan' -Detail 'Starting Defender full scan and re-reading health status.' -Percent 20
  Set-Output "Running full local scan..."
  try {
    Start-MpScan -ScanType FullScan | Out-Null
    Set-Output "Full Defender scan started. It may continue in the background."
  } catch {
    Set-Output "Defender full scan could not be started: $($_.Exception.Message)"
  }
  try {
    Refresh-UI
  } catch {
    Set-Output "Refresh after scan failed: $($_.Exception.Message)"
  } finally {
    Set-Busy -Busy $false
  }
})

$SiteButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Loading live site data' -Detail 'Checking domains, AdSense, and recommendations.' -Percent 20
  try {
    Refresh-Sites
  } catch {
    Set-Output "Site load failed: $($_.Exception.Message)"
  } finally {
    Set-Busy -Busy $false
  }
})

$KillButton.Add_Click({
  $selected = $ProcessGrid.SelectedItem
  if (-not $selected) {
    Set-Output "Pick a process row first."
    return
  }
  if ($necessary -contains $selected.ProcessName) {
    Set-Output "$($selected.ProcessName) is marked necessary. I did not kill it."
    return
  }
  try {
    Set-Busy -Busy $true -Phase 'Killing process' -Detail "Stopping $($selected.ProcessName) (PID $($selected.Id))." -Percent 70
    Stop-Process -Id $selected.Id -Force
    Set-Output "Killed $($selected.ProcessName) (PID $($selected.Id))."
    Refresh-UI
  } catch {
    Set-Output "Could not kill $($selected.ProcessName): $($_.Exception.Message)"
  } finally {
    Set-Busy -Busy $false
  }
})

$SafeButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Showing necessary processes' -Detail 'Filtering to core Windows and always-on helpers.' -Percent 60
  try {
    $safe = Get-ImportantProcesses
    $ProcessGrid.ItemsSource = $safe
    $ProcessSummary.Text = 'Necessary and core processes only.'
    Set-Output "Showing only necessary/core processes."
  } finally {
    Set-Busy -Busy $false
  }
})

$AllButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Showing all apps' -Detail 'Restoring the full running process list.' -Percent 55
  try {
    Refresh-UI
    Set-Output "Showing all processes."
  } finally {
    Set-Busy -Busy $false
  }
})

$TestBackendButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Testing backend' -Detail 'Calling local security helpers and live portfolio API.' -Percent 25
  try {
    $health = Invoke-Json -Path '/health'
    $stats = Invoke-Json -Path '/stats'
    $sites = Invoke-Json -Path '/ops/sites/overview'
    Set-Output (@(
      "Backend OK: $($health.ok) at $($health.at)"
      "Sites: $($stats.sites) | Incidents: $($stats.openIncidents) | Bridges: $($stats.bridgeEnabledSites)"
      "Loaded site overview count: $(@($sites.overview).Count)"
    ) -join [Environment]::NewLine)
    Set-FlowFast 'Backend test complete' 'API health, stats, and live site overview responded.' 100 'Ready'
  } catch {
    Set-Output "Backend test failed: $($_.Exception.Message)"
    Set-FlowFast 'Backend test failed' 'One or more API calls failed. Check the URL and auth.' 100 'Needs attention'
  } finally {
    Set-Busy -Busy $false
  }
})

$OpenHelperButton.Add_Click({
  Set-Busy -Busy $true -Phase 'Recreating desktop icon' -Detail 'Writing the shortcut to your desktop.' -Percent 85
  Start-Process -FilePath $scriptPath -ArgumentList '-InstallShortcut'
  Set-Output "Desktop shortcut creation requested."
  Set-Busy -Busy $false
})

$OpenVaultButton.Add_Click({
  Set-Flow -Title 'Opening web console' -Text 'Launching the browser-based operations console.' -Percent 100 -Meta 'Opening browser'
  Start-Process 'https://3000studios.vip/vault/ops'
})

if (-not (Test-Path $shortcutPath)) {
  New-Shortcut -TargetPath (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe') -Arguments "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Description '3000 Studios Helper'
}

[void]$window.ShowDialog()
