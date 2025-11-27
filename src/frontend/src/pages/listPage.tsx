import { Table, Card, Tag, Space, Typography, Flex } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Dados mock para visualização
const mockEvents = [
  {
    id: 1,
    type: 'Consulta Médica',
    name: 'Consulta Cardiologista',
    date: '2024-12-15',
    time: '14:30',
    target: { name: 'Dr. Silva', type: 'médico' },
    location: 'Hospital São Lucas',
    status: 'agendado',
    suggestion: 'Leve documentos e histórico médico'
  },
  {
    id: 2,
    type: 'Aniversário',
    name: 'Aniversário da Larissa',
    date: '2024-12-20',
    time: '19:00',
    target: { name: 'Larissa', type: 'aniversariante' },
    location: 'Casa da Larissa',
    status: 'confirmado',
    suggestion: 'Comprar presente: livro de arte'
  },
  {
    id: 3,
    type: 'Reunião',
    name: 'Reunião de Projeto',
    date: '2024-12-18',
    time: '10:00',
    target: { name: 'TechCorp', type: 'empresa' },
    location: 'Escritório Central',
    status: 'pendente',
    suggestion: 'Preparar apresentação e vestir traje social'
  }
];

function ListPage() {
  const columns = [
    {
      title: 'Evento',
      key: 'event',
      render: (record: any) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Tag color="blue">{record.type}</Tag>
        </div>
      )
    },
    {
      title: 'Data & Hora',
      key: 'datetime',
      render: (record: any) => (
        <Space direction="vertical" size="small">
          <Text>
            <CalendarOutlined /> {new Date(record.date).toLocaleDateString('pt-BR')}
          </Text>
          <Text>
            <ClockCircleOutlined /> {record.time}
          </Text>
        </Space>
      )
    },
    {
      title: 'Local',
      dataIndex: 'location',
      render: (location: string) => (
        <Text>
          <EnvironmentOutlined /> {location}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => {
        const color = status === 'agendado' ? 'green' : 
                     status === 'confirmado' ? 'blue' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Flex justify="center" style={{ marginBottom: '2rem' }}>
        <Title level={2} style={{ color: '#13C2C2', textAlign: 'center' }}>
          📅 Meus Agendamentos
        </Title>
      </Flex>

      <Card
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(19, 194, 194, 0.3)',
          borderRadius: '12px',
        }}
      >
        <Table
          columns={columns}
          dataSource={mockEvents}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{
            background: 'transparent'
          }}
        />
      </Card>
    </div>
  );
}

export default ListPage;