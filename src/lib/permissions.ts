export const isAdmin = (email: string | undefined) => {
  return email === "tournamentsakamao@gmail.com";
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

