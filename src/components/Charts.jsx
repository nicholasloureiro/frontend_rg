import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import '../styles/Charts.css';

// Gráfico de Pizza - Vendas por Tipo
export const VendasPorTipoChart = ({ data }) => {
  const chartData = [
    { id: 'Locação', label: 'Locação', value: data.locacao, color: '#1EC1BC' },
    { id: 'Venda', label: 'Venda', value: data.venda, color: '#10a3ff' }
  ];

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.6}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="var(--color-text-primary)"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        arcLabel={(d) => `${d.value}`}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: 'var(--color-text-primary)',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle'
          }
        ]}
        theme={{
          labels: {
            text: {
              fontSize: 14,
              fontWeight: 600
            }
          },
          legends: {
            text: {
              fill: 'var(--color-text-primary)'
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
      />
    </div>
  );
};

// Gráfico de Barras - Conversão por Atendente
export const ConversaoPorAtendenteChart = ({ data }) => {
  // Função para determinar a cor baseada na taxa de conversão
  const getBarColor = (taxa) => {
    if (taxa >= 70) return '#10b981'; // Verde - Excelente
    if (taxa >= 60) return '#f59e0b'; // Amarelo - Bom
    if (taxa >= 50) return '#ef4444'; // Vermelho - Precisa melhorar
    return '#6b7280'; // Cinza - Muito baixo
  };

  const chartData = data.map(atendente => ({
    atendente: atendente.nome.split(' ')[0], // Pega só o primeiro nome
    nomeCompleto: atendente.nome,
    taxa: atendente.taxa,
    conversoes: atendente.conversoes,
    atendimentos: atendente.atendimentos,
    totalAtendimentos: atendente.totalAtendimentos || atendente.atendimentos,
    finalizados: atendente.finalizados || 0,
    cancelados: atendente.cancelados || 0,
    emAndamento: atendente.emAndamento || 0,
    totalVendido: atendente.totalVendido || 0,
    totalRecebido: atendente.totalRecebido || 0,
    itensVendidos: atendente.itensVendidos || 0,
    color: getBarColor(atendente.taxa)
  }));

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsiveBar
        data={chartData}
        keys={['taxa']}
        indexBy="atendente"
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={(bar) => bar.data.color}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -15,
          legend: 'Atendente',
          legendPosition: 'middle',
          legendOffset: 40
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Taxa de Conversão (%)',
          legendPosition: 'middle',
          legendOffset: -50,
          format: (value) => `${value}%`
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        label={(d) => `${d.value.toFixed(1)}%`}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: 'var(--color-text-secondary)'
              }
            },
            legend: {
              text: {
                fill: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 500
              }
            }
          },
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 600
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
        tooltip={({ indexValue, data }) => (
          <div style={{
            background: 'var(--color-bg-card)',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)',
            minWidth: '200px'
          }}>
            <div style={{ 
              fontWeight: 600, 
              marginBottom: '8px', 
              fontSize: '14px',
              color: data.color 
            }}>
              {data.nomeCompleto}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Taxa de Conversão:</strong> {data.taxa.toFixed(1)}%
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Conversões:</strong> {data.conversoes}/{data.atendimentos}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Total de Atendimentos:</strong> {data.totalAtendimentos}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Finalizados:</strong> {data.finalizados}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Cancelados:</strong> {data.cancelados}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Em Andamento:</strong> {data.emAndamento}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Total Vendido:</strong> R$ {data.totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ marginBottom: '4px' }}>
              <strong>Total Recebido:</strong> R$ {data.totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div>
              <strong>Itens Vendidos:</strong> {data.itensVendidos}
            </div>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Pizza - Vendas por Canal
export const VendasPorCanalChart = ({ data }) => {
  const colors = ['#1EC1BC', '#10a3ff', '#a855f7', '#ec4899', '#f59e0b'];
  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="var(--color-text-primary)"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        arcLabel={(d) => `${d.value}`}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 10,
            itemWidth: 80,
            itemHeight: 18,
            itemTextColor: 'var(--color-text-primary)',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 14,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: 'var(--color-primary)'
                }
              }
            ]
          }
        ]}
        theme={{
          labels: {
            text: {
              fontSize: 13,
              fontWeight: 600
            }
          },
          legends: {
            text: {
              fontSize: 11,
              fill: 'var(--color-text-primary)'
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
        tooltip={({ datum }) => (
          <div style={{
            background: 'var(--color-bg-card)',
            padding: '9px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)'
          }}>
            <strong>{datum.label}</strong>
            <div>{datum.value} vendas ({datum.data.percentual}%)</div>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Pizza - Tipo de Cliente
export const TipoClienteChart = ({ data }) => {
  const colors = ['#1EC1BC', '#10a3ff', '#a855f7', '#ec4899', '#f59e0b'];
  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsivePie
        data={chartData}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ datum: 'data.color' }}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="var(--color-text-primary)"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        arcLabel={(d) => `${d.value}`}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 10,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: 'var(--color-text-primary)',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 14,
            symbolShape: 'circle'
          }
        ]}
        theme={{
          labels: {
            text: {
              fontSize: 13,
              fontWeight: 600
            }
          },
          legends: {
            text: {
              fontSize: 11,
              fill: 'var(--color-text-primary)'
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
        tooltip={({ datum }) => (
          <div style={{
            background: 'var(--color-bg-card)',
            padding: '9px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)'
          }}>
            <strong>{datum.label}</strong>
            <div>{datum.value} clientes ({datum.data.percentual}%)</div>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Barras Horizontais - Motivos de Recusa
export const MotivosRecusaChart = ({ data }) => {
  const chartData = data.map(item => ({
    motivo: item.motivo.length > 20 ? item.motivo.substring(0, 18) + '...' : item.motivo,
    quantidade: item.quantidade,
    percentual: item.percentual
  }));

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsiveBar
        data={chartData}
        keys={['quantidade']}
        indexBy="motivo"
        layout="horizontal"
        margin={{ top: 20, right: 30, bottom: 50, left: 160 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#ef4444']}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Quantidade',
          legendPosition: 'middle',
          legendOffset: 40
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: 'var(--color-text-secondary)',
                fontSize: 11
              }
            },
            legend: {
              text: {
                fill: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 500
              }
            }
          },
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 600
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
        tooltip={({ indexValue, value, data }) => (
          <div style={{
            background: 'var(--color-bg-card)',
            padding: '9px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)'
          }}>
            <strong>{indexValue}</strong>
            <div>{value} recusas ({data.percentual}%)</div>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Linha - Evolução do Ticket Médio
export const TicketMedioChart = ({ data }) => {
  const chartData = [
    {
      id: 'Ticket Médio',
      data: data.map(item => ({
        x: item.periodo || item.mes, // Suporta tanto 'periodo' quanto 'mes'
        y: item.valor
      }))
    }
  ];

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 30, right: 30, bottom: 50, left: 70 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false
        }}
        curve="catmullRom"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Mês',
          legendOffset: 36,
          legendPosition: 'middle'
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Valor (R$)',
          legendOffset: -60,
          legendPosition: 'middle',
          format: (value) => `R$ ${value.toFixed(0)}`
        }}
        colors={['#1EC1BC']}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: 'var(--color-text-secondary)'
              }
            },
            legend: {
              text: {
                fill: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 500
              }
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
        tooltip={({ point }) => (
          <div style={{
            background: 'var(--color-bg-card)',
            padding: '9px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)'
          }}>
            <strong>{point.data.x}</strong>
            <div>R$ {point.data.y.toFixed(2)}</div>
          </div>
        )}
      />
    </div>
  );
};

// Gráfico de Barras - Clientes Atendidos por Período
export const ClientesAtendidosChart = ({ data }) => {
  return (
    <div className="chart-container" style={{ height: '250px' }}>
      <ResponsiveBar
        data={data}
        keys={['clientes']}
        indexBy="periodo"
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#10a3ff']}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Mês',
          legendPosition: 'middle',
          legendOffset: 40
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Clientes',
          legendPosition: 'middle',
          legendOffset: -50
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: 'var(--color-text-secondary)'
              }
            },
            legend: {
              text: {
                fill: 'var(--color-text-primary)',
                fontSize: 12,
                fontWeight: 500
              }
            }
          },
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 600
            }
          },
          tooltip: {
            container: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: 12,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid var(--color-border)',
              padding: '8px 12px'
            }
          }
        }}
      />
    </div>
  );
};

// Card de Estatística Simples
export const StatCard = ({ title, value, subtitle, icon, color = '#1EC1BC' }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-icon" style={{ color: color }}>
          {icon}
        </span>
        <span className="stat-card-title">{title}</span>
      </div>
      <div className="stat-card-value" style={{ color: color }}>{value}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
};
