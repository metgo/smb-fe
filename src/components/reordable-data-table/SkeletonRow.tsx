const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div
        className="h-5 rounded bg-gray-200 dark:bg-gray-700"
        style={{ width: 18, opacity: 0.6 }}
      />
    </td>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div
          className="h-6 rounded-md bg-gray-200 dark:bg-gray-700"
          style={{
            width: `${45 + Math.random() * 40}%`,
            opacity: 1 - i * 0.06,
          }}
        />
      </td>
    ))}
  </tr>
);

export default SkeletonRow;
