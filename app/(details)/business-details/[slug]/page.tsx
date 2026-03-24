import { getQueryClient } from '@/lib/getQueryClient';
import { getBusinessDetailsBySlug } from '@/actions/businessActions';
import { getProducts } from '@/actions/productActions';
import NoFeedItemLayout from '@/components/layouts/NoFeedItemLayout';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { BusinessDetailsContent } from '../_components';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const page = async ({ params }: PageProps) => {
  const { slug } = await params;
  const queryClient = getQueryClient();

  if (!slug || slug === 'undefined') {
    return <NoFeedItemLayout />;
  }

  const businessDetails = await getBusinessDetailsBySlug(slug);

  if (!businessDetails) {
    return <NoFeedItemLayout />;
  }

  queryClient.setQueryData(['business-details', slug], businessDetails);

  await queryClient.prefetchQuery({
    queryKey: ['products', businessDetails._id],
    queryFn: () => getProducts(businessDetails._id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BusinessDetailsContent businessDetails={businessDetails} />
    </HydrationBoundary>
  );
};

export default page;
