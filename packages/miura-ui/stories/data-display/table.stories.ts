import '../../src/data-display/table';

export default {
  title: 'miura-ui/Data Display/Table',
  component: 'mui-table',
};

export const Default = {
  render: () => `
    <mui-table>
      <table>
        <thead><tr><th>Name</th><th>Email</th></tr></thead>
        <tbody>
          <tr><td>Alice</td><td>alice@example.com</td></tr>
          <tr><td>Bob</td><td>bob@example.com</td></tr>
        </tbody>
      </table>
    </mui-table>
  `
}; 