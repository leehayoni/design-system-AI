/// <reference types="@figma/plugin-typings" />
console.log('Design System AI Plugin loaded!');
figma.showUI(__html__, { width: 900, height: 600 });
// Safe CSV field sanitization
function sanitizeCSVField(value) {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}
// Recursively traverse all child nodes with safety limits
function traverseAllNodes(node, maxDepth = 10, maxNodes = 1000) {
    const nodes = [];
    const visited = new Set();
    function traverse(currentNode, depth = 0) {
        if (depth > maxDepth || nodes.length >= maxNodes || visited.has(currentNode)) {
            return;
        }
        visited.add(currentNode);
        nodes.push(currentNode);
        if ('children' in currentNode && Array.isArray(currentNode.children)) {
            for (const child of currentNode.children) {
                if (child && child !== currentNode) {
                    traverse(child, depth + 1);
                }
            }
        }
    }
    traverse(node);
    return nodes;
}
function extractColorTokens(node) {
    const colors = [];
    if ('fills' in node && Array.isArray(node.fills)) {
        for (const fill of node.fills) {
            if (fill.type === 'SOLID' && fill.color) {
                const hex = [
                    Math.round(fill.color.r * 255).toString(16).padStart(2, '0'),
                    Math.round(fill.color.g * 255).toString(16).padStart(2, '0'),
                    Math.round(fill.color.b * 255).toString(16).padStart(2, '0')
                ].join('');
                colors.push(`#${hex}`);
            }
        }
    }
    return colors;
}
function extractTypographyTokens(node) {
    const typography = [];
    if ('fontName' in node && node.fontName) {
        const fontName = node.fontName;
        if (typeof fontName === 'object' && fontName.family) {
            typography.push(`${fontName.family}-${fontName.style || 'Regular'}`);
        }
    }
    if ('fontSize' in node && node.fontSize) {
        typography.push(`Size-${node.fontSize}`);
    }
    return typography;
}
function extractSpacingTokens(node) {
    const spacing = [];
    if ('paddingTop' in node && node.paddingTop) {
        spacing.push(`Padding-Top-${node.paddingTop}`);
    }
    if ('paddingBottom' in node && node.paddingBottom) {
        spacing.push(`Padding-Bottom-${node.paddingBottom}`);
    }
    if ('paddingLeft' in node && node.paddingLeft) {
        spacing.push(`Padding-Left-${node.paddingLeft}`);
    }
    if ('paddingRight' in node && node.paddingRight) {
        spacing.push(`Padding-Right-${node.paddingRight}`);
    }
    if ('itemSpacing' in node && node.itemSpacing) {
        spacing.push(`Item-Spacing-${node.itemSpacing}`);
    }
    return spacing;
}
function extractRadiusTokens(node) {
    const radius = [];
    if ('cornerRadius' in node && node.cornerRadius) {
        const cornerRadius = node.cornerRadius;
        if (typeof cornerRadius === 'number') {
            radius.push(`Radius-${cornerRadius}`);
        }
        else if (typeof cornerRadius === 'object') {
            radius.push(`Radius-${cornerRadius.topLeft || 0}`);
        }
    }
    return radius;
}
function extractElevationTokens(node) {
    const elevation = [];
    if ('effects' in node && Array.isArray(node.effects)) {
        for (const effect of node.effects) {
            if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                elevation.push(`${effect.type}-${effect.radius || 0}`);
            }
        }
    }
    return elevation;
}
let lastAnalysisData = null;
function analyzeFrame(frame) {
    console.log(`Analyzing frame: ${frame.name}`);
    figma.notify(`Frame "${frame.name}" selected. Analysis started.`);
    const allNodes = traverseAllNodes(frame);
    console.log(`Found ${allNodes.length} nodes to analyze`);
    const colorTokens = new Set();
    const typographyTokens = new Set();
    const spacingTokens = new Set();
    const radiusTokens = new Set();
    const elevationTokens = new Set();
    const componentCounts = {};
    let totalInstances = 0;
    let totalFrames = 0;
    let autoLayoutFrames = 0;
    for (const node of allNodes) {
        extractColorTokens(node).forEach(color => colorTokens.add(color));
        extractTypographyTokens(node).forEach(typography => typographyTokens.add(typography));
        extractSpacingTokens(node).forEach(spacing => spacingTokens.add(spacing));
        extractRadiusTokens(node).forEach(radius => radiusTokens.add(radius));
        extractElevationTokens(node).forEach(elevation => elevationTokens.add(elevation));
        if (node.type === 'INSTANCE') {
            totalInstances++;
            const componentName = node.name || 'Unnamed Component';
            componentCounts[componentName] = (componentCounts[componentName] || 0) + 1;
        }
        if (node.type === 'FRAME') {
            totalFrames++;
            if (node.layoutMode && node.layoutMode !== 'NONE') {
                autoLayoutFrames++;
            }
        }
    }
    const totalTokens = colorTokens.size + typographyTokens.size + spacingTokens.size + radiusTokens.size + elevationTokens.size;
    const automationRate = totalFrames > 0 ? Math.round((autoLayoutFrames / totalFrames) * 100) : 0;
    const componentLabels = Object.keys(componentCounts);
    const componentValues = Object.values(componentCounts);
    const totalComponents = componentValues.reduce((sum, count) => sum + count, 0);
    const tokenChart = {
        labels: ['Color', 'Typography', 'Spacing', 'Border Radius', 'Elevation'],
        values: [
            colorTokens.size,
            typographyTokens.size,
            spacingTokens.size,
            radiusTokens.size,
            elevationTokens.size
        ],
        total: totalTokens
    };
    const componentUsageData = {
        labels: componentLabels,
        values: componentValues,
        total: totalComponents
    };
    const frameInfo = {
        name: frame.name,
        width: frame.width,
        height: frame.height
    };
    const ds = {
        tokens: totalTokens,
        components: totalComponents,
        automation: automationRate
    };
    console.log('Analysis complete:', {
        frameInfo,
        ds,
        tokenChart,
        componentUsageData
    });
    console.log('Sending ANALYZE_SELECTION_RESULTS to UI...');
    figma.ui.postMessage({
        pluginMessage: {
            type: 'ANALYZE_SELECTION_RESULTS',
            data: {
                frameInfo,
                ds,
                tokenChart,
                componentUsageData
            }
        }
    });
    console.log('ANALYZE_SELECTION_RESULTS message sent to UI');
    // Store data in memory only
    lastAnalysisData = {
        frameInfo,
        colorTokens: Array.from(colorTokens),
        typographyTokens: Array.from(typographyTokens),
        spacingTokens: Array.from(spacingTokens),
        radiusTokens: Array.from(radiusTokens),
        elevationTokens: Array.from(elevationTokens),
        componentCounts
    };
}
function generateCSVReport() {
    try {
        console.log('generateCSVReport called');
        if (!lastAnalysisData) {
            figma.notify('No analysis data available. Please select a frame first.');
            return;
        }
        const data = lastAnalysisData;
        const csvRows = [];
        csvRows.push(['Token Type', 'Token Name', 'Frame Name', 'Frame Size']);
        data.colorTokens.forEach((token) => {
            csvRows.push([
                sanitizeCSVField('Color'),
                sanitizeCSVField(token),
                sanitizeCSVField(data.frameInfo.name),
                sanitizeCSVField(`${data.frameInfo.width}x${data.frameInfo.height}`)
            ]);
        });
        data.typographyTokens.forEach((token) => {
            csvRows.push([
                sanitizeCSVField('Typography'),
                sanitizeCSVField(token),
                sanitizeCSVField(data.frameInfo.name),
                sanitizeCSVField(`${data.frameInfo.width}x${data.frameInfo.height}`)
            ]);
        });
        data.spacingTokens.forEach((token) => {
            csvRows.push([
                sanitizeCSVField('Spacing'),
                sanitizeCSVField(token),
                sanitizeCSVField(data.frameInfo.name),
                sanitizeCSVField(`${data.frameInfo.width}x${data.frameInfo.height}`)
            ]);
        });
        data.radiusTokens.forEach((token) => {
            csvRows.push([
                sanitizeCSVField('Border Radius'),
                sanitizeCSVField(token),
                sanitizeCSVField(data.frameInfo.name),
                sanitizeCSVField(`${data.frameInfo.width}x${data.frameInfo.height}`)
            ]);
        });
        data.elevationTokens.forEach((token) => {
            csvRows.push([
                sanitizeCSVField('Elevation'),
                sanitizeCSVField(token),
                sanitizeCSVField(data.frameInfo.name),
                sanitizeCSVField(`${data.frameInfo.width}x${data.frameInfo.height}`)
            ]);
        });
        const csvContent = csvRows.map(row => row.join(',')).join('\n');
        console.log('CSV generated successfully');
        console.log('CSV content length:', csvContent.length);
        console.log('Sending CSV_REPORT_DATA to UI...');
        figma.notify('CSV report generated successfully!');
        figma.ui.postMessage({
            pluginMessage: {
                type: 'CSV_REPORT_DATA',
                data: { content: csvContent }
            }
        });
        console.log('CSV_REPORT_DATA message sent to UI');
    }
    catch (error) {
        console.error('Error generating CSV:', error);
        figma.notify('Error generating CSV report');
    }
}
// Message handler
figma.ui.onmessage = (msg) => {
    console.log('Message received from UI:', msg);
    try {
        if (msg.type === 'ANALYZE_SELECTION') {
            handleSelectionChange();
        }
        else if (msg.type === 'GENERATE_CSV_REPORT') {
            console.log('Calling generateCSVReport...');
            if (typeof generateCSVReport === 'function') {
                generateCSVReport();
            }
            else {
                console.error('generateCSVReport is not a function');
                figma.notify('Error: generateCSVReport function not found');
            }
        }
        else if (msg.type === 'GENERATE_COMPONENTS_CSV') {
            if (lastAnalysisData) {
                const data = lastAnalysisData;
                const csvRows = [['Component Name', 'Usage Count', 'Frame Name']];
                Object.entries(data.componentCounts).forEach(([name, count]) => {
                    csvRows.push([
                        sanitizeCSVField(name),
                        sanitizeCSVField(count),
                        sanitizeCSVField(data.frameInfo.name)
                    ]);
                });
                const csvContent = csvRows.map(row => row.join(',')).join('\n');
                figma.ui.postMessage({
                    pluginMessage: {
                        type: 'COMPONENTS_CSV_DATA',
                        data: { content: csvContent }
                    }
                });
            }
        }
    }
    catch (error) {
        console.error('Error in message handler:', error);
        figma.notify('Error processing message');
    }
};
function handleSelectionChange() {
    console.log('handleSelectionChange called');
    const selection = figma.currentPage.selection;
    console.log('Selection length:', selection.length);
    if (selection.length === 0) {
        console.log('No selection, sending NO_FRAME_SELECTED');
        figma.ui.postMessage({ pluginMessage: { type: 'NO_FRAME_SELECTED' } });
        return;
    }
    const frame = selection.find(node => node.type === 'FRAME');
    console.log('Found frame:', frame ? frame.name : 'No frame found');
    if (frame) {
        console.log('Calling analyzeFrame for:', frame.name);
        analyzeFrame(frame);
    }
    else {
        console.log('No frame in selection, sending NO_FRAME_SELECTED');
        figma.ui.postMessage({ pluginMessage: { type: 'NO_FRAME_SELECTED' } });
    }
}
// Listen for selection changes
figma.on('selectionchange', () => {
    console.log('Selection changed event triggered');
    console.log('Current selection:', figma.currentPage.selection);
    handleSelectionChange();
});
// Initial analysis
console.log('Plugin initialized, running initial analysis...');
handleSelectionChange();
